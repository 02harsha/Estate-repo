// User Database Simulation (localStorage)
class UserDatabase {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.usedCodes = this.loadUsedCodes();
    }

    loadUsers() {
        const users = localStorage.getItem('realestate_users');
        const loadedUsers = users ? JSON.parse(users) : [];

        // Migration: Add totalShares to existing users if missing
        loadedUsers.forEach(user => {
            if (user.totalShares === undefined) {
                user.totalShares = user.referrals ? user.referrals.length : 0;
            }
        });

        return loadedUsers;
    }

    loadCurrentUser() {
        const user = localStorage.getItem('realestate_current_user');
        const loadedUser = user ? JSON.parse(user) : null;

        // Migration: Add totalShares if missing
        if (loadedUser && loadedUser.totalShares === undefined) {
            loadedUser.totalShares = loadedUser.referrals ? loadedUser.referrals.length : 0;
        }

        return loadedUser;
    }

    loadUsedCodes() {
        const codes = localStorage.getItem('realestate_used_codes');
        return codes ? JSON.parse(codes) : [];
    }

    saveUsers() {
        localStorage.setItem('realestate_users', JSON.stringify(this.users));
    }

    saveCurrentUser(user) {
        localStorage.setItem('realestate_current_user', JSON.stringify(user));
        this.currentUser = user;
    }

    saveUsedCodes() {
        localStorage.setItem('realestate_used_codes', JSON.stringify(this.usedCodes));
    }

    generateUniqueReferralCode() {
        // Generate a unique 8-character alphanumeric code
        let code;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            code = this.generateRandomCode();
            attempts++;
            if (attempts > maxAttempts) {
                // If somehow we've tried 1000 times, add timestamp to ensure uniqueness
                code = code + Date.now().toString(36).slice(-4).toUpperCase();
            }
        } while (this.usedCodes.includes(code));

        this.usedCodes.push(code);
        this.saveUsedCodes();
        return code;
    }

    generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async register(name, email, phone, password, referralCode = '') {
        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    email,
                    phone_number: phone,
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
    }

    async login(emailOrPhone, password) {
        try {
            const payload = { password };
            // Simple check to decide if email or phone
            if (emailOrPhone.includes('@')) {
                payload.email = emailOrPhone;
            } else {
                payload.phone_number = emailOrPhone;
            }

            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Map backend user to frontend structure
                const user = {
                    id: data.user.id,
                    name: data.user.full_name,
                    email: data.user.email,
                    phone: data.user.phone_number,
                    referralCode: data.user.referral_code,
                    // Default values for fields not yet returned by backend
                    points: 0,
                    totalShares: 0,
                    referrals: [],
                    lastCoinTap: null
                };

                this.saveCurrentUser(user);
                return { success: true, message: 'Login successful!', user: user };
            } else {
                return { success: false, message: data.message || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please make sure the server is running.' };
        }
    }

    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers();
            if (this.currentUser && this.currentUser.id === userId) {
                this.saveCurrentUser(this.users[userIndex]);
            }
            return this.users[userIndex];
        }

        // Fallback: If user not in local DB (API user), update currentUser directly
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = { ...this.currentUser, ...updates };
            this.saveCurrentUser(this.currentUser);
            return this.currentUser;
        }
        return null;
    }

    logout() {
        localStorage.removeItem('realestate_current_user');
        this.currentUser = null;
    }

    getReferralStats(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return { completed: 0, pending: 0, total: 0 };

        const completed = user.referrals ? user.referrals.length : 0;
        const total = user.totalShares || 0;
        const pending = total - completed;

        return {
            completed: completed,
            pending: pending > 0 ? pending : 0,
            total: total
        };
    }

    incrementShareCount(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.totalShares = (user.totalShares || 0) + 1;
            this.updateUser(userId, { totalShares: user.totalShares });
        }
    }

    canTapCoin(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user || !user.lastCoinTap) return true;

        const lastTap = new Date(user.lastCoinTap);
        const now = new Date();
        const hoursSinceLastTap = (now - lastTap) / (1000 * 60 * 60);

        return hoursSinceLastTap >= 24;
    }

    async tapCoin(userId) {
        try {
            const response = await fetch('http://localhost:3000/api/points/addPointsOnDailyCheckIn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state to reflect change immediately
                const user = this.users.find(u => u.id === userId);
                if (user) {
                    user.points = (user.points || 0) + 10000;
                    user.lastCoinTap = new Date().toISOString();
                    this.updateUser(userId, { points: user.points, lastCoinTap: user.lastCoinTap });
                }
                return { success: true, message: '+10,000 Points!', user: user };
            } else {
                return { success: false, message: data.message || 'Failed to claim points' };
            }

        } catch (error) {
            console.error('Tap coin error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    async getCurrentPoints(userId) {
        try {
            const response = await fetch('http://localhost:3000/api/points/getCurrentPoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (response.ok && data.currentPoints) {
                const points = data.currentPoints.points;
                this.updateUser(userId, { points: points });
                return points;
            }
        } catch (e) {
            console.error('Get points error:', e);
        }
        return 0;
    }
}

// Initialize database
const db = new UserDatabase();

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const homeScreen = document.getElementById('homeScreen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dailyCoin = document.getElementById('dailyCoin');
const toast = document.getElementById('toast');

// Check URL parameters for referral code
function checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');

    if (referralCode) {
        // Auto-fill referral code in registration form
        document.getElementById('regReferral').value = referralCode.toUpperCase();
        // Switch to register tab
        switchTab('register');
        showToast('Referral code applied! Complete registration to join.', 'success');
    }
}

// Initialize App
function initApp() {
    createParticles();
    checkReferralCode();

    if (db.currentUser) {
        showHomeScreen();
    } else {
        showLoginScreen();
    }
}

// Create background particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 100 + 50 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Tab Switching
function switchTab(tab) {
    const loginTab = document.querySelector('.auth-tab:first-child');
    const registerTab = document.querySelector('.auth-tab:last-child');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOrPhone = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        const result = await db.login(emailOrPhone, password);

        if (result.success) {
            showToast(result.message, 'success');
            setTimeout(() => showHomeScreen(), 500);
        } else {
            showToast(result.message, 'error');
        }
    } finally {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const referralCode = document.getElementById('regReferral').value.trim();

    if (!name || !phone || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
        const result = await db.register(name, email || '', phone, password, referralCode);

        if (result.success) {
            showToast(result.message, 'success');
            // Switch to login tab after success
            setTimeout(() => {
                switchTab('login');
                // Pre-fill email/phone if available
                document.getElementById('loginEmail').value = email || phone;
            }, 1000);
        } else {
            showToast(result.message, 'error');
        }
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Show Login Screen
function showLoginScreen() {
    loginScreen.classList.add('active');
    homeScreen.classList.remove('active');
}

// Show Home Screen
function showHomeScreen() {
    loginScreen.classList.remove('active');
    homeScreen.classList.add('active');

    updateHomeScreen();
}

// Update Home Screen with User Data
async function updateHomeScreen() {
    // Refresh current user data from database
    if (db.currentUser && db.currentUser.id) {
        // Fetch latest points from server
        await db.getCurrentPoints(db.currentUser.id);

        const freshUser = db.users.find(u => u.id === db.currentUser.id);
        if (freshUser) {
            db.currentUser = freshUser;
            db.saveCurrentUser(freshUser);
        }
    }

    const user = db.currentUser;
    if (!user) return;

    // Update user info
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;

    // Update points with animation
    animatePoints(user.points);

    // Update referral code
    document.getElementById('userReferralCode').textContent = user.referralCode;

    // Update coin status
    updateCoinStatus();

    // Update referral stats
    updateReferralStats();
}

// Update Referral Statistics
function updateReferralStats() {
    const user = db.currentUser;
    if (!user) return;

    const stats = db.getReferralStats(user.id);

    document.getElementById('completedReferrals').textContent = stats.completed;
    document.getElementById('pendingReferrals').textContent = stats.pending;
    document.getElementById('totalReferrals').textContent = stats.total;
}

// Animate Points Counter
function animatePoints(targetPoints) {
    const pointsElement = document.getElementById('userPoints');
    const currentPoints = parseInt(pointsElement.textContent.replace(/,/g, '')) || 0;
    const duration = 1000;
    const steps = 50;
    const increment = (targetPoints - currentPoints) / steps;
    const stepDuration = duration / steps;

    let current = currentPoints;
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetPoints) || (increment < 0 && current <= targetPoints)) {
            current = targetPoints;
            clearInterval(timer);
        }
        pointsElement.textContent = Math.floor(current).toLocaleString();
    }, stepDuration);
}

// Update Coin Status
function updateCoinStatus() {
    const user = db.currentUser;
    const coinContainer = document.getElementById('coinContainer');
    const coinStatus = document.getElementById('coinStatus');
    const coin = document.getElementById('dailyCoin');

    if (db.canTapCoin(user.id)) {
        coin.classList.remove('disabled');
        coinStatus.textContent = 'Tap to claim 10,000 points!';
        coinStatus.style.color = 'var(--success-color)';
    } else {
        coin.classList.add('disabled');
        const lastTap = new Date(user.lastCoinTap);
        const nextTap = new Date(lastTap.getTime() + 24 * 60 * 60 * 1000);
        const hoursLeft = Math.ceil((nextTap - new Date()) / (1000 * 60 * 60));
        coinStatus.textContent = `Come back in ${hoursLeft} hours`;
        coinStatus.style.color = 'var(--text-secondary)';
    }
}

// Daily Coin Tap Handler
dailyCoin.addEventListener('click', async () => {
    const user = db.currentUser;
    if (!user) return;

    // Disable coin to prevent double tap
    if (dailyCoin.classList.contains('disabled')) {
        const result = db.tapCoin(user.id); // For existing 'come back later' message
        if (!result.success) showToast(result.message, 'error');
        return;
    }

    const result = await db.tapCoin(user.id);

    if (result.success) {
        // Add animation
        dailyCoin.classList.add('tapped');
        setTimeout(() => dailyCoin.classList.remove('tapped'), 600);

        // Show floating points
        showFloatingPoints(dailyCoin, '+10,000');

        // Update UI
        showToast(result.message, 'success');
        updateHomeScreen();

    } else {
        showToast(result.message, 'error');
    }
});

// Show Floating Points Animation
function showFloatingPoints(element, text) {
    const floatingPoints = document.createElement('div');
    floatingPoints.className = 'floating-points';
    floatingPoints.textContent = text;

    const rect = element.getBoundingClientRect();
    floatingPoints.style.left = (rect.left + rect.width / 2) + 'px';
    floatingPoints.style.top = (rect.top + rect.height / 2) + 'px';

    document.body.appendChild(floatingPoints);

    setTimeout(() => {
        floatingPoints.remove();
    }, 1500);
}

// Share Referral Code
async function shareReferral() {
    const user = db.currentUser;
    if (!user) return;

    const referralUrl = `${window.location.origin}${window.location.pathname}?ref=${user.referralCode}`;
    const shareText = `Join RealEstate Pro and start earning rewards! Use my referral code: ${user.referralCode}\n\n${referralUrl}`;

    // Increment share count
    db.incrementShareCount(user.id);
    updateReferralStats();

    // Check if Web Share API is available
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Join RealEstate Pro',
                text: shareText,
                url: referralUrl
            });
            showToast('Shared successfully!', 'success');
        } catch (error) {
            if (error.name !== 'AbortError') {
                fallbackShare(shareText);
            }
        }
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method (copy to clipboard)
function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Referral link copied to clipboard!', 'success');
        }).catch(() => {
            showShareOptions(text);
        });
    } else {
        showShareOptions(text);
    }
}

// Copy Referral Code
function copyReferralCode() {
    const codeElement = document.getElementById('userReferralCode');
    const code = codeElement.innerText || codeElement.textContent;

    if (code === 'LOADING...') return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('Referral code copied!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(code);
        });
    } else {
        fallbackCopy(code);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Referral code copied!', 'success');
        } else {
            showToast('Failed to copy code', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
        showToast('Failed to copy code', 'error');
    }

    document.body.removeChild(textArea);
}

// Show share options
function showShareOptions(text) {
    const shareOptions = [
        { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(text)}` },
        { name: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(text)}` },
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
        { name: 'Email', url: `mailto:?subject=Join RealEstate Pro&body=${encodeURIComponent(text)}` }
    ];

    // Create share modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--card-bg);
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        border: 1px solid var(--border-color);
    `;

    modalContent.innerHTML = `
        <h3 style="margin-bottom: 20px; color: var(--text-primary);">Share via</h3>
        <div style="display: grid; gap: 10px;">
            ${shareOptions.map(option => `
                <a href="${option.url}" target="_blank" style="
                    display: block;
                    padding: 15px;
                    background: var(--dark-bg);
                    border-radius: 10px;
                    color: var(--text-primary);
                    text-decoration: none;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='var(--primary-color)'" 
                   onmouseout="this.style.background='var(--dark-bg)'">
                    ${option.name}
                </a>
            `).join('')}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
            width: 100%;
            margin-top: 15px;
            padding: 12px;
            background: var(--danger-color);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
        ">Close</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        db.logout();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            showLoginScreen();
            loginForm.reset();
            registerForm.reset();
        }, 500);
    }
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password');

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    } else {
        input.type = 'password';
        icon.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Make functions available globally
window.switchTab = switchTab;
window.shareReferral = shareReferral;
window.logout = logout;
window.togglePassword = togglePassword;
window.copyReferralCode = copyReferralCode;