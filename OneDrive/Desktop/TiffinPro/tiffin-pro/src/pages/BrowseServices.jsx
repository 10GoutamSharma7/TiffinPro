import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, Star, UtensilsCrossed, Package } from 'lucide-react';

const BrowseServices = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        city: '',
        serviceType: 'all',
        maxPrice: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const servicesRef = collection(db, 'services');
            const q = query(servicesRef, where('isActive', '==', true));
            const querySnapshot = await getDocs(q);

            const servicesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setServices(servicesData);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.serviceName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            service.description?.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCity = !filters.city || service.location?.city?.toLowerCase().includes(filters.city.toLowerCase());
        const matchesType = filters.serviceType === 'all' || service.serviceType?.includes(filters.serviceType);
        const matchesPrice = !filters.maxPrice || service.pricing?.twoTimesPerMonth <= parseInt(filters.maxPrice);

        return matchesSearch && matchesCity && matchesType && matchesPrice;
    });

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            {/* Header */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                    Browse Tiffin Services
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Found {filteredServices.length} services near you
                </p>
            </div>

            {/* Filters */}
            <div className="glass-morphism" style={{
                maxWidth: '1200px',
                margin: '0 auto 40px',
                padding: '30px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <Search size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Service name..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            City
                        </label>
                        <input
                            type="text"
                            placeholder="Enter city..."
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Service Type
                        </label>
                        <select
                            value={filters.serviceType}
                            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="dineIn">Dine In</option>
                            <option value="parcel">Parcel</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <DollarSign size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Max Price/Month
                        </label>
                        <input
                            type="number"
                            placeholder="Max budget..."
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading services...</p>
                </div>
            ) : filteredServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                        No services found. Try adjusting your filters.
                    </p>
                </div>
            ) : (
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '30px'
                }}>
                    {filteredServices.map((service) => (
                        <motion.div
                            key={service.id}
                            whileHover={{ y: -5 }}
                            className="glass-morphism"
                            style={{ overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => navigate(`/service/${service.id}`)}
                        >
                            {/* Service Image */}
                            <div style={{
                                height: '200px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={service.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"}
                                    alt={service.serviceName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000";
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    display: 'flex',
                                    gap: '10px'
                                }}>
                                    {service.serviceType?.map((type) => (
                                        <span
                                            key={type}
                                            className="glass-morphism"
                                            style={{
                                                padding: '5px 12px',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                background: 'rgba(0,0,0,0.6)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            {type === 'dineIn' ? <UtensilsCrossed size={14} /> : <Package size={14} />}
                                            {type === 'dineIn' ? 'Dine In' : 'Parcel'}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Service Info */}
                            <div style={{ padding: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '1.3rem' }}>{service.serviceName}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffb142' }}>
                                        <Star size={16} fill="#ffb142" />
                                        {service.ratings?.average?.toFixed(1) || 'New'}
                                    </div>
                                </div>

                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    marginBottom: '15px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {service.description}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <MapPin size={16} />
                                    {service.location?.area}, {service.location?.city}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: '15px',
                                    borderTop: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 Time/Month</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            ₹{service.pricing?.oneTimeDay || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2 Times/Month</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            ₹{service.pricing?.twoTimesPerMonth || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseServices;
