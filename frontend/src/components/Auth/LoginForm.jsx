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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await login(emailOrPhone, password);
            if (result.success) {
                toast.success(result.message);
                navigate('/');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="auth-form active" onSubmit={handleSubmit}>
            <div className="input-group">
                <label>Phone Number</label>
                <input
                    type="text"
                    placeholder="Enter your phone number"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <p className="form-footer">Forgot password? <a href="#">Reset here</a></p>
        </form>
    );
};

export default LoginForm;
