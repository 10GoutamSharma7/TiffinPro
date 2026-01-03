import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUserRole = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserRole must be used within UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const { user, isLoaded } = useUser();
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!isLoaded) return;

            if (!user) {
                setUserRole(null);
                setUserProfile(null);
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', user.id);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserRole(data.role);
                    setUserProfile(data);
                } else {
                    // New user - no role set yet
                    setUserRole(null);
                    setUserProfile(null);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user, isLoaded]);

    const setRole = async (role, additionalData = {}) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.id);
            const userData = {
                uid: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                name: user.fullName || user.firstName || 'User',
                role: role,
                createdAt: new Date(),
                ...additionalData
            };

            await setDoc(userDocRef, userData, { merge: true });
            setUserRole(role);
            setUserProfile(userData);
        } catch (error) {
            console.error('Error setting user role:', error);
            throw error;
        }
    };

    return (
        <UserContext.Provider value={{ userRole, userProfile, setRole, loading }}>
            {children}
        </UserContext.Provider>
    );
};
