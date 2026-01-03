import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../context/UserContext';
import { motion } from 'framer-motion';
import { ChefHat, Users, MapPin, Phone } from 'lucide-react';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { setRole } = useUserRole();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        phone: '',
        city: '',
        area: ''
    });

    const handleRoleSelect = async (role) => {
        if (!formData.phone || !formData.city) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await setRole(role, {
                phone: formData.phone,
                location: {
                    city: formData.city,
                    area: formData.area
                }
            });

            // Navigate based on role
            if (role === 'customer') {
                navigate('/browse');
            } else {
                navigate('/provider/dashboard');
            }
        } catch (error) {
            console.error('Error setting role:', error);
            alert('Failed to set role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--bg-dark)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism"
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                <ChefHat size={48} style={{ color: 'var(--primary)', margin: '0 auto 20px' }} />
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome to TiffinPro!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Let's get you started. How would you like to use TiffinPro?
                </p>

                {/* Basic Info Form */}
                <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <Phone size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            City *
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Area (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your area/locality"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
                </div>

                {/* Role Selection */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRole('customer')}
                        className={selectedRole === 'customer' ? 'btn-primary' : 'btn-secondary'}
                        style={{
                            padding: '30px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            border: selectedRole === 'customer' ? '2px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <Users size={32} />
                        <span style={{ fontWeight: 600 }}>I'm a Customer</span>
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Looking for tiffin services</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRole('provider')}
                        className={selectedRole === 'provider' ? 'btn-primary' : 'btn-secondary'}
                        style={{
                            padding: '30px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            border: selectedRole === 'provider' ? '2px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <ChefHat size={32} />
                        <span style={{ fontWeight: 600 }}>I'm a Provider</span>
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>I offer tiffin services</span>
                    </motion.button>
                </div>

                <button
                    onClick={() => selectedRole && handleRoleSelect(selectedRole)}
                    disabled={!selectedRole || loading || !formData.phone || !formData.city}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1.1rem',
                        opacity: (!selectedRole || loading || !formData.phone || !formData.city) ? 0.5 : 1,
                        cursor: (!selectedRole || loading || !formData.phone || !formData.city) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Setting up...' : 'Continue'}
                </button>
            </motion.div>
        </div>
    );
};

export default RoleSelection;
