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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.name || !formData.phone || !formData.place || !formData.password) {
            toast.error('Please fill all required fields');
            setIsLoading(false);
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
                toast.success(result.message);
                onSuccess(formData.phone);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <form className="auth-form active" onSubmit={handleSubmit}>
            <div className="input-group">
                <label>Full Name</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>
            <div className="input-group">
                <label>Place</label>
                <input
                    type="text"
                    id="place"
                    placeholder="Enter your place"
                    required
                    value={formData.place}
                    onChange={handleChange}
                />
            </div>
            <div className="input-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>
            <div className="input-group">
                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Create a password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>
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
