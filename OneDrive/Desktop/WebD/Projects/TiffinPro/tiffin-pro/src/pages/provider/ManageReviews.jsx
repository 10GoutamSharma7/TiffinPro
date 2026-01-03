import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MessageSquare, TrendingUp, Award } from 'lucide-react';

const ManageReviews = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [user]);

    const fetchReviews = async () => {
        if (!user) return;

        try {
            // Get provider's service
            const servicesRef = collection(db, 'services');
            const serviceQuery = query(servicesRef, where('providerId', '==', user.id));
            const serviceSnapshot = await getDocs(serviceQuery);

            if (!serviceSnapshot.empty) {
                const serviceId = serviceSnapshot.docs[0].id;

                // Fetch reviews
                const reviewsRef = collection(db, 'reviews');
                const reviewsQuery = query(
                    reviewsRef,
                    where('serviceId', '==', serviceId)
                );
                const reviewsSnapshot = await getDocs(reviewsQuery);

                const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                reviewsData.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
                setReviews(reviewsData);

                // Calculate stats
                const total = reviewsData.length;
                let sum = 0;
                const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                reviewsData.forEach(review => {
                    sum += review.rating;
                    ratingCounts[review.rating]++;
                });

                setStats({
                    totalReviews: total,
                    averageRating: total > 0 ? (sum / total).toFixed(1) : 0,
                    fiveStars: ratingCounts[5],
                    fourStars: ratingCounts[4],
                    threeStars: ratingCounts[3],
                    twoStars: ratingCounts[2],
                    oneStar: ratingCounts[1]
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRatingBar = (count, total) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <div style={{
                width: '100%',
                height: '8px',
                background: 'var(--glass)',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/provider/dashboard')}
                    className="btn-secondary"
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Customer Reviews</h1>

                {/* Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '40px' }}>
                    {/* Overall Rating */}
                    <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center' }}>
                        <Award size={48} style={{ color: '#ffb142', margin: '0 auto 20px' }} />
                        <div style={{ fontSize: '4rem', fontWeight: 700, color: '#ffb142', marginBottom: '10px' }}>
                            {stats.averageRating}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={24}
                                    fill={star <= Math.round(stats.averageRating) ? '#ffb142' : 'none'}
                                    style={{ color: '#ffb142' }}
                                />
                            ))}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="glass-morphism" style={{ padding: '40px' }}>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={24} /> Rating Distribution
                        </h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {[
                                { stars: 5, count: stats.fiveStars },
                                { stars: 4, count: stats.fourStars },
                                { stars: 3, count: stats.threeStars },
                                { stars: 2, count: stats.twoStars },
                                { stars: 1, count: stats.oneStar }
                            ].map(({ stars, count }) => (
                                <div key={stars} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Star size={16} fill="#ffb142" style={{ color: '#ffb142' }} />
                                        <span>{stars} Star{stars !== 1 ? 's' : ''}</span>
                                    </div>
                                    {getRatingBar(count, stats.totalReviews)}
                                    <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                                        {count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="glass-morphism" style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={24} /> All Reviews
                    </h2>

                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                                No reviews yet. Encourage your customers to leave feedback!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '25px' }}>
                            {reviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '25px',
                                        background: 'var(--glass)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '5px' }}>
                                                {review.customerName}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {review.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) || 'Recently'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={18}
                                                    fill={star <= review.rating ? '#ffb142' : 'none'}
                                                    style={{ color: '#ffb142' }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p style={{
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.6,
                                        fontSize: '1rem',
                                        padding: '15px',
                                        background: 'var(--bg-dark)',
                                        borderRadius: '8px',
                                        borderLeft: '3px solid var(--primary)'
                                    }}>
                                        "{review.comment}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageReviews;
