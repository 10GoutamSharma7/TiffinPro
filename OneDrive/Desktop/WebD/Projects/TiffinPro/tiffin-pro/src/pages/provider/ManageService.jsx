import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Calendar } from 'lucide-react';

const ManageService = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [serviceId, setServiceId] = useState(null);
    const [formData, setFormData] = useState({
        serviceName: '',
        description: '',
        location: { address: '', city: '', area: '' },
        serviceType: [],
        pricing: { oneTimeDay: '', oneTimeNight: '', twoTimesPerMonth: '' },
        contactInfo: { email: '', phone: '', whatsapp: '' },
        imageUrl: '',
        isActive: true
    });

    useEffect(() => {
        fetchService();
    }, [user]);

    const fetchService = async () => {
        if (!user) return;

        try {
            const servicesRef = collection(db, 'services');
            const q = query(servicesRef, where('providerId', '==', user.id));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const serviceData = querySnapshot.docs[0].data();
                setServiceId(querySnapshot.docs[0].id);
                setFormData({
                    serviceName: serviceData.serviceName || '',
                    description: serviceData.description || '',
                    location: serviceData.location || { address: '', city: '', area: '' },
                    serviceType: serviceData.serviceType || [],
                    pricing: serviceData.pricing || { oneTimeDay: '', oneTimeNight: '', twoTimesPerMonth: '' },
                    contactInfo: serviceData.contactInfo || { email: '', phone: '', whatsapp: '' },
                    imageUrl: serviceData.imageUrl || '',
                    isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
                });
            }
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            serviceType: prev.serviceType.includes(type)
                ? prev.serviceType.filter(t => t !== type)
                : [...prev.serviceType, type]
        }));
    };

    const handleSave = async () => {
        if (!formData.serviceName || !formData.description || !formData.location.city) {
            alert('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const serviceData = {
                ...formData,
                providerId: user.id,
                updatedAt: new Date(),
                ratings: { average: 0, count: 0 }
            };

            if (serviceId) {
                // Update existing service
                await updateDoc(doc(db, 'services', serviceId), serviceData);
                alert('Service updated successfully!');
            } else {
                // Create new service
                serviceData.createdAt = new Date();
                const docRef = await addDoc(collection(db, 'services'), serviceData);
                setServiceId(docRef.id);
                alert('Service created successfully!');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Failed to save service. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/provider/dashboard')}
                    className="btn-secondary"
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>
                    {serviceId ? 'Manage Your Service' : 'Create Your Service'}
                </h1>

                <div className="glass-morphism" style={{ padding: '40px' }}>
                    {/* Basic Info */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Basic Information</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Service Name *</label>
                            <input
                                type="text"
                                value={formData.serviceName}
                                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                placeholder="e.g., Aunty's Home Kitchen"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your tiffin service..."
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Service Image URL</label>
                        <input
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/your-image.jpg"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                marginBottom: '10px'
                            }}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Paste a direct link to an image of your food or service. If left blank, a default image will be used.
                        </p>
                    </div>

                    {(formData.imageUrl || true) && (
                        <div style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '20px',
                            border: '1px solid var(--glass-border)',
                            position: 'relative'
                        }}>
                            <img
                                src={formData.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"}
                                alt="Service Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000";
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                color: '#fff'
                            }}>
                                {formData.imageUrl ? 'Custom Image' : 'Default Image'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Location */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Location</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>City *</label>
                            <input
                                type="text"
                                value={formData.location.city}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, city: e.target.value }
                                })}
                                placeholder="City"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Area</label>
                            <input
                                type="text"
                                value={formData.location.area}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, area: e.target.value }
                                })}
                                placeholder="Area/Locality"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Full Address</label>
                        <input
                            type="text"
                            value={formData.location.address}
                            onChange={(e) => setFormData({
                                ...formData,
                                location: { ...formData.location, address: e.target.value }
                            })}
                            placeholder="Complete address"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>

                {/* Service Type */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Service Type</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => handleServiceTypeToggle('dineIn')}
                            className={formData.serviceType.includes('dineIn') ? 'btn-primary' : 'btn-secondary'}
                            style={{ flex: 1, padding: '15px' }}
                        >
                            Dine In
                        </button>
                        <button
                            onClick={() => handleServiceTypeToggle('parcel')}
                            className={formData.serviceType.includes('parcel') ? 'btn-primary' : 'btn-secondary'}
                            style={{ flex: 1, padding: '15px' }}
                        >
                            Parcel
                        </button>
                    </div>
                </div>

                {/* Pricing */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Pricing (per month)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>1 Time (Day)</label>
                            <input
                                type="number"
                                value={formData.pricing.oneTimeDay}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, oneTimeDay: e.target.value }
                                })}
                                placeholder="₹"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>1 Time (Night)</label>
                            <input
                                type="number"
                                value={formData.pricing.oneTimeNight}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, oneTimeNight: e.target.value }
                                })}
                                placeholder="₹"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>2 Times (Day+Night)</label>
                            <input
                                type="number"
                                value={formData.pricing.twoTimesPerMonth}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    pricing: { ...formData.pricing, twoTimesPerMonth: e.target.value }
                                })}
                                placeholder="₹"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Contact Information</h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
                            <input
                                type="email"
                                value={formData.contactInfo.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contactInfo: { ...formData.contactInfo, email: e.target.value }
                                })}
                                placeholder="your@email.com"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Phone</label>
                            <input
                                type="tel"
                                value={formData.contactInfo.phone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contactInfo: { ...formData.contactInfo, phone: e.target.value }
                                })}
                                placeholder="+91 XXXXX XXXXX"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>WhatsApp</label>
                            <input
                                type="tel"
                                value={formData.contactInfo.whatsapp}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contactInfo: { ...formData.contactInfo, whatsapp: e.target.value }
                                })}
                                placeholder="+91 XXXXX XXXXX"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Status Toggle */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span>Service is Active (visible to customers)</span>
                    </label>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : (serviceId ? 'Update Service' : 'Create Service')}
                </button>
            </div>
        </div>
    );
};

export default ManageService;
