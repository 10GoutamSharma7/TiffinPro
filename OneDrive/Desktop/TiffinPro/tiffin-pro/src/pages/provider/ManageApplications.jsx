import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, Mail, Phone, MessageSquare, Filter } from 'lucide-react';

const ManageApplications = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

    useEffect(() => {
        fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        if (!user) return;

        try {
            // First get provider's service
            const servicesRef = collection(db, 'services');
            const serviceQuery = query(servicesRef, where('providerId', '==', user.id));
            const serviceSnapshot = await getDocs(serviceQuery);

            if (!serviceSnapshot.empty) {
                const serviceId = serviceSnapshot.docs[0].id;

                // Fetch applications
                const applicationsRef = collection(db, 'applications');
                const appQuery = query(applicationsRef, where('serviceId', '==', serviceId));
                const appSnapshot = await getDocs(appQuery);

                const apps = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort by date, newest first
                apps.sort((a, b) => (b.appliedAt?.toDate?.() || 0) - (a.appliedAt?.toDate?.() || 0));
                setApplications(apps);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (appId, newStatus) => {
        try {
            await updateDoc(doc(db, 'applications', appId), {
                status: newStatus
            });

            // Update local state
            setApplications(applications.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));

            alert(`Application ${newStatus} successfully!`);
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Failed to update application status');
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#f59e0b20', color: '#f59e0b', icon: Clock },
            accepted: { bg: '#10b98120', color: '#10b981', icon: CheckCircle },
            rejected: { bg: '#ef444420', color: '#ef4444', icon: XCircle }
        };

        const style = styles[status] || styles.pending;
        const Icon = style.icon;

        return (
            <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                background: style.bg,
                color: style.color,
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <Icon size={14} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading applications...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <button
                    onClick={() => navigate('/provider/dashboard')}
                    className="btn-secondary"
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Customer Applications</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {filteredApplications.length} {filter !== 'all' ? filter : ''} application(s)
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-morphism" style={{ padding: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Filter size={18} />
                        <span style={{ fontWeight: 600 }}>Filter by Status:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={filter === status ? 'btn-primary' : 'btn-secondary'}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <div className="glass-morphism" style={{ padding: '60px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                            No {filter !== 'all' ? filter : ''} applications found
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {filteredApplications.map((app) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism"
                                style={{ padding: '30px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{app.customerName}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                                <Mail size={16} />
                                                <a href={`mailto:${app.customerEmail}`} style={{ color: 'var(--text-primary)' }}>
                                                    {app.customerEmail}
                                                </a>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                                <Phone size={16} />
                                                <a href={`tel:${app.customerPhone}`} style={{ color: 'var(--text-primary)' }}>
                                                    {app.customerPhone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>

                                <div style={{
                                    padding: '20px',
                                    background: 'var(--glass)',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                                Preferred Plan
                                            </div>
                                            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                                {app.preferredPlan?.replace(/([A-Z])/g, ' $1').trim()}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                                Applied On
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                            </div>
                                        </div>
                                    </div>

                                    {app.message && (
                                        <div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <MessageSquare size={14} />
                                                Customer Message
                                            </div>
                                            <div style={{
                                                padding: '12px',
                                                background: 'var(--bg-dark)',
                                                borderRadius: '8px',
                                                fontStyle: 'italic',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                "{app.message}"
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {app.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button
                                            onClick={() => updateApplicationStatus(app.id, 'accepted')}
                                            className="btn-primary"
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                background: '#10b981'
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            Accept Application
                                        </button>
                                        <button
                                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                            className="btn-secondary"
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                borderColor: '#ef4444',
                                                color: '#ef4444'
                                            }}
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {app.status === 'accepted' && (
                                    <div style={{
                                        padding: '15px',
                                        background: '#10b98120',
                                        borderRadius: '8px',
                                        color: '#10b981',
                                        textAlign: 'center'
                                    }}>
                                        ✓ You have accepted this application. Please contact the customer to proceed.
                                    </div>
                                )}

                                {app.status === 'rejected' && (
                                    <div style={{
                                        padding: '15px',
                                        background: '#ef444420',
                                        borderRadius: '8px',
                                        color: '#ef4444',
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>This application was rejected</span>
                                        <button
                                            onClick={() => updateApplicationStatus(app.id, 'pending')}
                                            className="btn-secondary"
                                            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                        >
                                            Reconsider
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageApplications;
