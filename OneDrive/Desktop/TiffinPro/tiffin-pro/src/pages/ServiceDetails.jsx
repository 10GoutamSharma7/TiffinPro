import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { useUserRole } from '../context/UserContext';
import { motion } from 'framer-motion';
import {
    MapPin, Phone, Mail, Star, Calendar, UtensilsCrossed,
    Package, Clock, ArrowLeft, Send, MessageSquare
} from 'lucide-react';

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { userProfile } = useUserRole();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicationData, setApplicationData] = useState({
        preferredPlan: 'twoTimes',
        message: ''
    });

    useEffect(() => {
        fetchServiceDetails();
        fetchReviews();
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            const serviceDoc = await getDoc(doc(db, 'services', id));
            if (serviceDoc.exists()) {
                setService({ id: serviceDoc.id, ...serviceDoc.data() });
            }
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const reviewsRef = collection(db, 'reviews');
            const q = query(reviewsRef, where('serviceId', '==', id));
            const querySnapshot = await getDocs(q);
            const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(reviewsData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleApply = async () => {
        if (!user) {
            alert('Please sign in to apply');
            return;
        }

        try {
            await addDoc(collection(db, 'applications'), {
                serviceId: id,
                customerId: user.id,
                customerName: userProfile?.name || user.fullName,
                customerEmail: userProfile?.email || user.primaryEmailAddress?.emailAddress,
                customerPhone: userProfile?.phone || '',
                preferredPlan: applicationData.preferredPlan,
                message: applicationData.message,
                status: 'pending',
                appliedAt: new Date()
            });

            alert('Application submitted successfully! The provider will contact you soon.');
            setShowApplicationForm(false);
            setApplicationData({ preferredPlan: 'twoTimes', message: '' });
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application. Please try again.');
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading service details...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Service not found</p>
            </div>
        );
    }

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {/* Hero Section */}
                <div className="glass-morphism" style={{ marginBottom: '30px', overflow: 'hidden' }}>
                    <div style={{
                        height: '400px',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={service.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"}
                            alt={service.serviceName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000";
                            }}
                        />
                    </div>

                    <div style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{service.serviceName}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <MapPin size={18} />
                                        {service.location?.area}, {service.location?.city}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffb142' }}>
                                        <Star size={18} fill="#ffb142" />
                                        {service.ratings?.average?.toFixed(1) || 'New'} ({service.ratings?.count || 0} reviews)
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                {service.serviceType?.map((type) => (
                                    <span
                                        key={type}
                                        className="glass-morphism"
                                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        {type === 'dineIn' ? <UtensilsCrossed size={18} /> : <Package size={18} />}
                                        {type === 'dineIn' ? 'Dine In' : 'Parcel'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {service.description}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                    {/* Main Content */}
                    <div>
                        {/* Pricing */}
                        <div className="glass-morphism" style={{ padding: '30px', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Pricing Plans</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                        1 Time Per Day (Day)
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        ₹{service.pricing?.oneTimeDay}/month
                                    </div>
                                </div>
                                <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                        1 Time Per Day (Night)
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        ₹{service.pricing?.oneTimeNight}/month
                                    </div>
                                </div>
                                <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '12px', gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                        2 Times Per Day (Day + Night)
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        ₹{service.pricing?.twoTimesPerMonth}/month
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '5px' }}>
                                        ⭐ Most Popular
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Menu */}
                        <div className="glass-morphism" style={{ padding: '30px', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Calendar size={24} /> Weekly Menu
                            </h2>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {weekDays.map((day) => (
                                    <div key={day} style={{
                                        padding: '15px',
                                        background: 'var(--glass)',
                                        borderRadius: '8px',
                                        display: 'grid',
                                        gridTemplateColumns: '120px 1fr 1fr',
                                        gap: '20px',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{day}</div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Day</div>
                                            <div>{service.weeklyMenu?.[day]?.day || 'Not specified'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Night</div>
                                            <div>{service.weeklyMenu?.[day]?.night || 'Not specified'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Holidays */}
                        {service.holidays && service.holidays.length > 0 && (
                            <div className="glass-morphism" style={{ padding: '30px', marginBottom: '30px' }}>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Upcoming Holidays</h2>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {service.holidays.map((holiday, idx) => (
                                        <div key={idx} style={{
                                            padding: '12px',
                                            background: 'var(--glass)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span>{holiday.reason}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {holiday.date?.toDate?.()?.toLocaleDateString() || 'TBD'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="glass-morphism" style={{ padding: '30px' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageSquare size={24} /> Customer Reviews
                            </h2>
                            {reviews.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review!</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    {reviews.map((review) => (
                                        <div key={review.id} style={{
                                            padding: '20px',
                                            background: 'var(--glass)',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <div style={{ fontWeight: 600 }}>{review.customerName}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffb142' }}>
                                                    <Star size={16} fill="#ffb142" />
                                                    {review.rating}
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                                                {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Contact Info */}
                        <div className="glass-morphism" style={{ padding: '25px', marginBottom: '20px', position: 'sticky', top: '20px' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Contact Information</h3>

                            <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Phone size={18} style={{ color: 'var(--primary)' }} />
                                    <a href={`tel:${service.contactInfo?.phone}`} style={{ color: 'var(--text-primary)' }}>
                                        {service.contactInfo?.phone}
                                    </a>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={18} style={{ color: 'var(--primary)' }} />
                                    <a href={`mailto:${service.contactInfo?.email}`} style={{ color: 'var(--text-primary)' }}>
                                        {service.contactInfo?.email}
                                    </a>
                                </div>
                            </div>

                            {!showApplicationForm ? (
                                <button
                                    onClick={() => setShowApplicationForm(true)}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                                >
                                    Apply Now
                                </button>
                            ) : (
                                <div>
                                    <h4 style={{ marginBottom: '15px' }}>Apply for Service</h4>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            Preferred Plan
                                        </label>
                                        <select
                                            value={applicationData.preferredPlan}
                                            onChange={(e) => setApplicationData({ ...applicationData, preferredPlan: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'var(--glass)',
                                                color: 'var(--text-primary)'
                                            }}
                                        >
                                            <option value="oneTimeDay">1 Time (Day) - ₹{service.pricing?.oneTimeDay}</option>
                                            <option value="oneTimeNight">1 Time (Night) - ₹{service.pricing?.oneTimeNight}</option>
                                            <option value="twoTimes">2 Times (Day+Night) - ₹{service.pricing?.twoTimesPerMonth}</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            Message (Optional)
                                        </label>
                                        <textarea
                                            value={applicationData.message}
                                            onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                                            placeholder="Any special requirements..."
                                            rows="4"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'var(--glass)',
                                                color: 'var(--text-primary)',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={handleApply}
                                            className="btn-primary"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <Send size={18} /> Submit
                                        </button>
                                        <button
                                            onClick={() => setShowApplicationForm(false)}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
