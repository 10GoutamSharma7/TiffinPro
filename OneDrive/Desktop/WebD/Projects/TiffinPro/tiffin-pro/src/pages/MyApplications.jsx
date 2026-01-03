import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useUserRole } from '../context/UserContext';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Send, CheckCircle } from 'lucide-react';

const MyApplications = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { userProfile } = useUserRole();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMyApplications();
    }, [user]);

    const fetchMyApplications = async () => {
        if (!user) return;

        try {
            const applicationsRef = collection(db, 'applications');
            const q = query(applicationsRef, where('customerId', '==', user.id));
            const querySnapshot = await getDocs(q);

            const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch service details for each application
            const appsWithServices = await Promise.all(
                apps.map(async (app) => {
                    const servicesRef = collection(db, 'services');
                    const serviceQuery = query(servicesRef, where('__name__', '==', app.serviceId));
                    const serviceSnapshot = await getDocs(serviceQuery);

                    if (!serviceSnapshot.empty) {
                        const serviceData = serviceSnapshot.docs[0].data();
                        return { ...app, service: { id: serviceSnapshot.docs[0].id, ...serviceData } };
                    }
                    return app;
                })
            );

            // Check if user has already reviewed each service
            const reviewsRef = collection(db, 'reviews');
            const appsWithReviewStatus = await Promise.all(
                appsWithServices.map(async (app) => {
                    const reviewQuery = query(
                        reviewsRef,
                        where('serviceId', '==', app.serviceId),
                        where('customerId', '==', user.id)
                    );
                    const reviewSnapshot = await getDocs(reviewQuery);
                    return { ...app, hasReviewed: !reviewSnapshot.empty };
                })
            );

            appsWithReviewStatus.sort((a, b) => (b.appliedAt?.toDate?.() || 0) - (a.appliedAt?.toDate?.() || 0));
            setApplications(appsWithReviewStatus);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (serviceId) => {
        if (!reviewData.comment.trim()) {
            alert('Please write a review comment');
            return;
        }

        setSubmitting(true);
        try {
            // Add review to reviews collection
            await addDoc(collection(db, 'reviews'), {
                serviceId: serviceId,
                customerId: user.id,
                customerName: userProfile?.name || user.fullName,
                rating: reviewData.rating,
                comment: reviewData.comment,
                createdAt: new Date()
            });

            // Update service rating
            const serviceRef = doc(db, 'services', serviceId);
            await updateDoc(serviceRef, {
                'ratings.count': increment(1),
                'ratings.total': increment(reviewData.rating)
            });

            // Calculate new average (this will be done in a cloud function in production)
            // For now, we'll fetch and recalculate
            const reviewsRef = collection(db, 'reviews');
            const reviewsQuery = query(reviewsRef, where('serviceId', '==', serviceId));
            const reviewsSnapshot = await getDocs(reviewsQuery);

            let totalRating = 0;
            reviewsSnapshot.forEach(doc => {
                totalRating += doc.data().rating;
            });
            const averageRating = totalRating / reviewsSnapshot.size;

            await updateDoc(serviceRef, {
                'ratings.average': averageRating
            });

            alert('Review submitted successfully!');
            setShowReviewForm(null);
            setReviewData({ rating: 5, comment: '' });
            fetchMyApplications(); // Refresh to show updated status
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#f59e0b20', color: '#f59e0b', text: 'Pending' },
            accepted: { bg: '#10b98120', color: '#10b981', text: 'Accepted' },
            rejected: { bg: '#ef444420', color: '#ef4444', text: 'Rejected' }
        };

        const style = styles[status] || styles.pending;

        return (
            <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                background: style.bg,
                color: style.color,
                fontSize: '0.85rem',
                fontWeight: 600
            }}>
                {style.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading your applications...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/browse')}
                    className="btn-secondary"
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={20} /> Back to Browse
                </button>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>My Applications</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    {applications.length} application(s)
                </p>

                {applications.length === 0 ? (
                    <div className="glass-morphism" style={{ padding: '60px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '20px' }}>
                            You haven't applied to any services yet
                        </p>
                        <button onClick={() => navigate('/browse')} className="btn-primary">
                            Browse Services
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '25px' }}>
                        {applications.map((app) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism"
                                style={{ padding: '30px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                                            {app.service?.serviceName || 'Service'}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                            {app.service?.location?.area}, {app.service?.location?.city}
                                        </p>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>

                                <div style={{
                                    padding: '20px',
                                    background: 'var(--glass)',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                                Applied On
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                                Preferred Plan
                                            </div>
                                            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                                {app.preferredPlan?.replace(/([A-Z])/g, ' $1').trim()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        onClick={() => navigate(`/service/${app.serviceId}`)}
                                        className="btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        View Service
                                    </button>

                                    {app.status === 'accepted' && !app.hasReviewed && (
                                        <button
                                            onClick={() => setShowReviewForm(app.id)}
                                            className="btn-primary"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <Star size={18} /> Leave Review
                                        </button>
                                    )}

                                    {app.hasReviewed && (
                                        <div style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#10b98120',
                                            borderRadius: '8px',
                                            color: '#10b981',
                                            textAlign: 'center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}>
                                            <CheckCircle size={18} /> Reviewed
                                        </div>
                                    )}
                                </div>

                                {/* Review Form */}
                                {showReviewForm === app.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{
                                            marginTop: '20px',
                                            padding: '25px',
                                            background: 'var(--glass)',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <h4 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Write Your Review</h4>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '10px' }}>Rating</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '2rem',
                                                            color: star <= reviewData.rating ? '#ffb142' : '#444'
                                                        }}
                                                    >
                                                        <Star size={32} fill={star <= reviewData.rating ? '#ffb142' : 'none'} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '10px' }}>Your Review</label>
                                            <textarea
                                                value={reviewData.comment}
                                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                                placeholder="Share your experience with this tiffin service..."
                                                rows="4"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--glass-border)',
                                                    background: 'var(--bg-dark)',
                                                    color: 'var(--text-primary)',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleSubmitReview(app.serviceId)}
                                                disabled={submitting}
                                                className="btn-primary"
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <Send size={18} />
                                                {submitting ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowReviewForm(null);
                                                    setReviewData({ rating: 5, comment: '' });
                                                }}
                                                className="btn-secondary"
                                                style={{ flex: 1 }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
