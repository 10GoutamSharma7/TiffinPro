import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeft, Save, Calendar, Plus, Trash2 } from 'lucide-react';

const ManageMenu = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [serviceId, setServiceId] = useState(null);
    const [weeklyMenu, setWeeklyMenu] = useState({
        monday: { day: '', night: '' },
        tuesday: { day: '', night: '' },
        wednesday: { day: '', night: '' },
        thursday: { day: '', night: '' },
        friday: { day: '', night: '' },
        saturday: { day: '', night: '' },
        sunday: { day: '', night: '' }
    });
    const [holidays, setHolidays] = useState([]);

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        fetchServiceMenu();
    }, [user]);

    const fetchServiceMenu = async () => {
        if (!user) return;

        try {
            const servicesRef = collection(db, 'services');
            const q = query(servicesRef, where('providerId', '==', user.id));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const serviceData = querySnapshot.docs[0].data();
                setServiceId(querySnapshot.docs[0].id);

                if (serviceData.weeklyMenu) {
                    setWeeklyMenu(serviceData.weeklyMenu);
                }

                if (serviceData.holidays) {
                    setHolidays(serviceData.holidays);
                }
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuChange = (day, mealTime, value) => {
        setWeeklyMenu(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [mealTime]: value
            }
        }));
    };

    const addHoliday = () => {
        setHolidays([...holidays, { date: '', reason: '' }]);
    };

    const removeHoliday = (index) => {
        setHolidays(holidays.filter((_, i) => i !== index));
    };

    const updateHoliday = (index, field, value) => {
        const updated = [...holidays];
        updated[index][field] = value;
        setHolidays(updated);
    };

    const handleSave = async () => {
        if (!serviceId) {
            alert('Please create a service first');
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, 'services', serviceId), {
                weeklyMenu,
                holidays: holidays.filter(h => h.date && h.reason), // Only save complete holidays
                updatedAt: new Date()
            });

            alert('Menu and holidays updated successfully!');
        } catch (error) {
            console.error('Error saving menu:', error);
            alert('Failed to save menu. Please try again.');
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

    if (!serviceId) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    Please create a service first before managing the menu.
                </p>
                <button
                    onClick={() => navigate('/provider/service')}
                    className="btn-primary"
                >
                    Create Service
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/provider/dashboard')}
                    className="btn-secondary"
                    style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Calendar size={36} />
                    Manage Weekly Menu & Holidays
                </h1>

                {/* Weekly Menu */}
                <div className="glass-morphism" style={{ padding: '40px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Weekly Menu</h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {weekDays.map((day) => (
                            <div key={day} style={{
                                padding: '20px',
                                background: 'var(--glass)',
                                borderRadius: '12px'
                            }}>
                                <h3 style={{
                                    textTransform: 'capitalize',
                                    marginBottom: '15px',
                                    fontSize: '1.2rem',
                                    color: 'var(--secondary)'
                                }}>
                                    {day}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            Day Menu
                                        </label>
                                        <input
                                            type="text"
                                            value={weeklyMenu[day]?.day || ''}
                                            onChange={(e) => handleMenuChange(day, 'day', e.target.value)}
                                            placeholder="e.g., Dal, Rice, Roti, Sabzi"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'var(--bg-dark)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            Night Menu
                                        </label>
                                        <input
                                            type="text"
                                            value={weeklyMenu[day]?.night || ''}
                                            onChange={(e) => handleMenuChange(day, 'night', e.target.value)}
                                            placeholder="e.g., Paneer, Roti, Rice"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'var(--bg-dark)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Holidays */}
                <div className="glass-morphism" style={{ padding: '40px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '1.8rem' }}>Upcoming Holidays</h2>
                        <button
                            onClick={addHoliday}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Add Holiday
                        </button>
                    </div>

                    {holidays.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                            No holidays added yet. Click "Add Holiday" to add one.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {holidays.map((holiday, index) => (
                                <div key={index} style={{
                                    padding: '20px',
                                    background: 'var(--glass)',
                                    borderRadius: '12px',
                                    display: 'grid',
                                    gridTemplateColumns: '200px 1fr auto',
                                    gap: '15px',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={holiday.date}
                                            onChange={(e) => updateHoliday(index, 'date', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'var(--bg-dark)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            Reason
                                        </label>
                                        <input
                                            type="text"
                                            value={holiday.reason}
                                            onChange={(e) => updateHoliday(index, 'reason', e.target.value)}
                                            placeholder="e.g., Diwali, Festival"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'var(--bg-dark)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeHoliday(index)}
                                        className="btn-secondary"
                                        style={{
                                            padding: '10px',
                                            borderColor: '#ef4444',
                                            color: '#ef4444'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '18px',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <Save size={22} />
                    {saving ? 'Saving...' : 'Save Menu & Holidays'}
                </button>
            </div>
        </div>
    );
};

export default ManageMenu;
