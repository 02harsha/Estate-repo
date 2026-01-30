import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="home-header">
            <div className="header-content">
                <div className="header-brand">
                    <h2>100CRORECLUB MNC</h2>
                </div>

                <nav className="header-nav">
                    <a href="#about">About Us</a>
                    <a href="#services">Services</a>
                    <a href="#contact">Contact</a>
                </nav>

                <div className="header-right" ref={dropdownRef}>
                    <div
                        className="user-profile-trigger"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="user-avatar">
                            <span>{initials}</span>
                        </div>
                        <div className="user-details-mini">
                            <span className="user-name">{user?.name}</span>
                        </div>
                        <ChevronDown size={16} className={`dropdown-arrow ${showDropdown ? 'rotate' : ''}`} />
                    </div>

                    {showDropdown && (
                        <div className="profile-dropdown">
                            <div className="dropdown-header">
                                <p className="dropdown-name">{user?.name}</p>
                                <p className="dropdown-phone">{user?.phone || user?.email}</p>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
