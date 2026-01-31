import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const RegisterForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        place: '',
        phone: '',
        password: '',
        referralCode: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setFormData(prev => ({ ...prev, referralCode: ref.toUpperCase() }));
            toast.success('Referral code applied!');
        }
    }, [searchParams]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Full Name is required';
        else if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';

        if (!formData.place) newErrors.place = 'Place is required';
        else if (formData.place.trim().length < 3) newErrors.place = 'Place must be at least 3 characters';

        const phoneRegex = /^\d{10}$/;
        if (!formData.phone) newErrors.phone = 'Phone Number is required';
        else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Enter a valid 10-digit phone number';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            // toast.error('Please fix the errors in the form');
            return;
        }

        try {
            const result = await register(
                formData.name,
                "", // Email is removed
                formData.phone,
                formData.place,
                formData.password,
                formData.referralCode
            );

            if (result.success) {
                toast.success('User Registration Successful! Please login.');
                onSuccess(formData.phone);
            } else {
                const newErrors = {};
                // Handle specific backend validation messages
                if (result.message.toLowerCase().includes('phone') && result.message.toLowerCase().includes('exists')) {
                    newErrors.phone = result.message;
                } else {
                    toast.error(result.message);
                }
                setErrors(newErrors);
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        // Clear error when user types
        if (errors[e.target.id]) {
            setErrors({ ...errors, [e.target.id]: '' });
        }
    };

    return (
        <form className="auth-form active" onSubmit={handleSubmit}>
            <div className="input-group">
                <label>Full Name</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="input-group">
                <label>Place</label>
                <input
                    type="text"
                    id="place"
                    placeholder="Enter your place"
                    value={formData.place}
                    onChange={handleChange}
                    className={errors.place ? 'error' : ''}
                />
                {errors.place && <span className="error-text">{errors.place}</span>}
            </div>
            <div className="input-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="input-group">
                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                    />
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="input-group">
                <label>Referral Code (Optional)</label>
                <input
                    type="text"
                    id="referralCode"
                    placeholder="Enter referral code if you have one"
                    value={formData.referralCode}
                    onChange={handleChange}
                />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="form-footer">By registering, you agree to our <a href="#">Terms & Conditions</a></p>
        </form>
    );
};

export default RegisterForm;
