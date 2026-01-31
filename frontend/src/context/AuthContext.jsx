import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('realestate_current_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('realestate_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('realestate_current_user');
        }
    }, [user]);

    const login = async (emailOrPhone, password) => {
        const result = await api.login(emailOrPhone, password);
        if (result.success) {
            // Map backend user to frontend structure, similar to script.js
            const mappedUser = {
                id: result.user.id,
                name: result.user.full_name,
                email: result.user.email,
                phone: result.user.phone_number,
                referralCode: result.user.referral_code,
                referralCode: result.user.referral_code,
                points: result.user.points || 0,
                completedReferrals: result.user.referral_count || 0,
                lastCoinTap: result.user.last_check_in_date
            };
            setUser(mappedUser);
        }
        return result;
    };

    const register = async (name, email, phone, place, password, referralCode) => {
        return await api.register(name, email, phone, place, password, referralCode);
    };

    const logout = () => {
        setUser(null);
    };

    const refreshPoints = async (userId) => {
        const points = await api.getCurrentPoints(userId || user?.id);
        setUser(prev => prev ? { ...prev, points } : prev);
        return points;
    };

    const updateStats = (updates) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    }

    const refreshReferralStats = async (userId) => {
        const stats = await api.getReferralStats(userId || user?.id);
        setUser(prev => prev ? { ...prev, ...stats } : prev);
        return stats;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshPoints, updateStats,refreshReferralStats }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
