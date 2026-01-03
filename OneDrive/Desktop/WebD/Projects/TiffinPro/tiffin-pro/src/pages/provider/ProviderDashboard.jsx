import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from "../../firebase";
import { motion } from 'framer-motion';
import {
    Users, FileText, Star, TrendingUp, Calendar,
    Settings, Menu as MenuIcon, Eye, CheckCircle, XCircle, Clock
} from 'lucide-react';

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        averageRating: 0,
        totalReviews: 0
    });
    const [service, setService] = useState(null);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            // Fetch provider's service
            const servicesRef = collection(db, 'services');
            const serviceQuery = query(servicesRef, where('providerId', '==', user.id));
            const serviceSnapshot = await getDocs(serviceQuery);

            if (!serviceSnapshot.empty) {
                const serviceData = { id: serviceSnapshot.docs[0].id, ...serviceSnapshot.docs[0].data() };
                setService(serviceData);

                // Fetch applications for this service
                const applicationsRef = collection(db, 'applications');
                const appQuery = query(applicationsRef, where('serviceId', '==', serviceData.id));
                const appSnapshot = await getDocs(appQuery);

                const applications = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecentApplications(applications.slice(0, 5)); // Latest 5

                const pending = applications.filter(app => app.status === 'pending').length;
                const accepted = applications.filter(app => app.status === 'accepted').length;

                // Fetch reviews
                const reviewsRef = collection(db, 'reviews');
                const reviewQuery = query(reviewsRef, where('serviceId', '==', serviceData.id));
                const reviewSnapshot = await getDocs(reviewQuery);

                setStats({
                    totalApplications: applications.length,
                    pendingApplications: pending,
                    acceptedApplications: accepted,
                    averageRating: serviceData.ratings?.average || 0,
                    totalReviews: serviceData.ratings?.count || 0
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, trend }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-morphism"
            style={{ padding: '25px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: `${color}20`,
                    color: color
                }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ade80', fontSize: '0.9rem' }}>
                        <TrendingUp size={16} />
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '5px' }}>{value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</div>
        </motion.div>
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    You haven't created a service yet.
                </p>
                <button
                    onClick={() => navigate('/provider/create-service')}
                    className="btn-primary"
                >
                    Create Your Service
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                        Welcome back! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Here's what's happening with your tiffin service today.
                    </p>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/provider/applications')}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FileText size={18} /> View Applications
                    </button>
                    <button
                        onClick={() => navigate('/provider/service')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Settings size={18} /> Manage Service
                    </button>
                    <button
                        onClick={() => navigate('/provider/menu')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <MenuIcon size={18} /> Update Menu
                    </button>
                    <button
                        onClick={() => navigate('/provider/reviews')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Star size={18} /> View Reviews
                    </button>
                    <button
                        onClick={() => navigate(`/service/${service.id}`)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Eye size={18} /> Preview Service
                    </button>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '25px',
                    marginBottom: '40px'
                }}>
                    <StatCard
                        icon={FileText}
                        label="Total Applications"
                        value={stats.totalApplications}
                        color="#3b82f6"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending Applications"
                        value={stats.pendingApplications}
                        color="#f59e0b"
                    />
                    <StatCard
                        icon={Users}
                        label="Active Customers"
                        value={stats.acceptedApplications}
                        color="#10b981"
                        trend="+12%"
                    />
                    <StatCard
                        icon={Star}
                        label="Average Rating"
                        value={stats.averageRating.toFixed(1)}
                        color="#ffb142"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                    {/* Recent Applications */}
                    <div className="glass-morphism" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.8rem' }}>Recent Applications</h2>
                            <button
                                onClick={() => navigate('/provider/applications')}
                                className="btn-secondary"
                                style={{ fontSize: '0.9rem' }}
                            >
                                View All
                            </button>
                        </div>

                        {recentApplications.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                                No applications yet
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {recentApplications.map((app) => (
                                    <div
                                        key={app.id}
                                        style={{
                                            padding: '20px',
                                            background: 'var(--glass)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '5px' }}>{app.customerName}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                {app.customerEmail} • {app.customerPhone}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                                Plan: {app.preferredPlan} • Applied {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                            </div>
                                        </div>
                                        <div>
                                            {app.status === 'pending' && (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    background: '#f59e0b20',
                                                    color: '#f59e0b',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <Clock size={14} /> Pending
                                                </span>
                                            )}
                                            {app.status === 'accepted' && (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    background: '#10b98120',
                                                    color: '#10b981',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <CheckCircle size={14} /> Accepted
                                                </span>
                                            )}
                                            {app.status === 'rejected' && (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    background: '#ef444420',
                                                    color: '#ef4444',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <XCircle size={14} /> Rejected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Service Overview */}
                    <div className="glass-morphism" style={{ padding: '30px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Your Service</h2>

                        <div style={{
                            padding: '15px',
                            background: 'var(--glass)',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '10px' }}>
                                {service.serviceName}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                                {service.location?.area}, {service.location?.city}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                {service.serviceType?.map((type) => (
                                    <span
                                        key={type}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            background: 'var(--primary)20',
                                            color: 'var(--primary)',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {type === 'dineIn' ? 'Dine In' : 'Parcel'}
                                    </span>
                                ))}
                            </div>

                            <div style={{
                                paddingTop: '15px',
                                borderTop: '1px solid var(--glass-border)',
                                display: 'grid',
                                gap: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status</span>
                                    <span style={{
                                        color: service.isActive ? '#10b981' : '#ef4444',
                                        fontWeight: 600
                                    }}>
                                        {service.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reviews</span>
                                    <span style={{ fontWeight: 600 }}>{stats.totalReviews}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rating</span>
                                    <span style={{ fontWeight: 600, color: '#ffb142' }}>
                                        ⭐ {stats.averageRating.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/provider/service')}
                            className="btn-primary"
                            style={{ width: '100%' }}
                        >
                            Edit Service Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
