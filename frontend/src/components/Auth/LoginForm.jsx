import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast'; // We'll need to install this or use our own Toast

const LoginForm = ({ initialPhone }) => {
    const [emailOrPhone, setEmailOrPhone] = useState(initialPhone || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        const phoneRegex = /^\d{10}$/;
        if (!emailOrPhone) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(emailOrPhone)) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(emailOrPhone, password);
            if (result.success) {
                toast.success(result.message);
                navigate('/');
            } else {
                // Handle specific backend errors if possible, otherwise general
                const newErrors = {};
                const msg = result.message.toLowerCase();

                // User not found -> Phone error
                if (msg.includes('user') || msg.includes('phone') || msg.includes('not found')) {
                    newErrors.phone = result.message;
                }
                // Password error or Generic invalid credentials
                else if (msg.includes('credentials') || msg.includes('password') || msg.includes('invalid')) {
                    newErrors.password = result.message;
                } else {
                    newErrors.general = result.message;
                }

                setErrors(newErrors);

                // Show toast only if it's a general error or network error, 
                // to avoid double feedback for inline errors which are already visible
                if (newErrors.general) {
                    toast.error(result.message || 'Login failed');
                }
            }
        } catch (error) {
            const msg = error.message || 'An error occurred during login';
            setErrors({ general: msg });
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        if (field === 'phone') setEmailOrPhone(value);
        if (field === 'password') setPassword(value);

        // Clear specific error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
    };

    return (
        <form className="auth-form active" onSubmit={handleSubmit}>
            <div className="input-group">
                <label>Phone Number</label>
                <input
                    type="text"
                    placeholder="Enter your phone number"
                    value={emailOrPhone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="input-group">
                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={errors.password ? 'error' : ''}
                    />
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
                {errors.general && <span className="error-text" style={{ marginTop: '10px', textAlign: 'center' }}>{errors.general}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <p className="form-footer">Forgot password? <a href="#">Reset here</a></p>
        </form>
    );
};

export default LoginForm;
