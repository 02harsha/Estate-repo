import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [registeredPhone, setRegisteredPhone] = useState('');

    return (
        <div id="loginScreen" className="screen active">
            <div className="container">
                <div className="logo-container">
                    <div className="logo">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 10 L90 40 L90 90 L60 90 L60 60 L40 60 L40 90 L10 90 L10 40 Z"
                                fill="currentColor" />
                            <circle cx="50" cy="35" r="8" fill="#fff" />
                        </svg>
                    </div>
                    <h1>RealEstate Pro</h1>
                    <p className="tagline">Your Success, Our Foundation</p>
                </div>

                <div className="auth-container">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Register
                        </button>
                    </div>

                    {activeTab === 'login' ? (
                        <LoginForm initialPhone={registeredPhone} />
                    ) : (
                        <RegisterForm onSuccess={(phone) => { setRegisteredPhone(phone); setActiveTab('login'); }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthContainer;
