const BASE_URL = 'http://localhost:3000/api';

export const api = {
    async register(name, email, phone, place, password, referralCode = '') {
        try {
            const response = await fetch(`${BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    email,
                    phone_number: phone,
                    place,
                    password,
                    referral_code: referralCode
                })
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true, message: 'Registration successful! Please login.', user: data.user };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please make sure the server is running.' };
        }
    },

    async login(emailOrPhone, password) {
        try {
            const payload = { password };
            if (emailOrPhone.includes('@')) {
                payload.email = emailOrPhone;
            } else {
                payload.phone_number = emailOrPhone;
            }

            const response = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                return { success: true, message: 'Login successful!', user: data.user };
            } else {
                return { success: false, message: data.message || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please make sure the server is running.' };
        }
    },

    async getCurrentPoints(userId) {
        try {
            const response = await fetch(`${BASE_URL}/points/getCurrentPoints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (response.ok && data.currentPoints) {
                return data.currentPoints.points;
            }
        } catch (e) {
            console.error('Get points error:', e);
        }
        return 0;
    },

    async tapCoin(userId) {
        try {
            const response = await fetch(`${BASE_URL}/points/addPointsOnDailyCheckIn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();

            if (response.ok) {
                return { success: true, message: '+10,000 Points!' };
            } else {
                return { success: false, message: data.message || 'Failed to claim points' };
            }
        } catch (error) {
            console.error('Tap coin error:', error);
            return { success: false, message: 'Network error' };
        }
    },


    async getReferralStats(userId) {
        try {
            const response = await fetch(`${BASE_URL}/points/getReferralStats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (response.ok && data.completedReferrals) {
                return data;
            }
        } catch (e) {
            console.error('Get referral stats error:', e);
        }
    }
};
