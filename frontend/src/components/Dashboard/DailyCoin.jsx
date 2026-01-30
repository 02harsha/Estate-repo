import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api'; // Direct API usage or via context
import { toast } from 'react-hot-toast';

const DailyCoin = () => {
    const { user, refreshPoints, updateStats } = useAuth();
    const [disabled, setDisabled] = useState(false);
    const [statusText, setStatusText] = useState('Tap to claim!');
    const [statusColor, setStatusColor] = useState('var(--success-color)');
    const [isTapped, setIsTapped] = useState(false);

    useEffect(() => {
        checkStatus();
        const timer = setInterval(checkStatus, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [user.lastCoinTap]);

    const checkStatus = () => {
        if (!user.lastCoinTap) {
            setDisabled(false);
            setStatusText('Tap to claim 10,000 points!');
            setStatusColor('var(--success-color)');
            return;
        }

        const lastTap = new Date(user.lastCoinTap);
        const now = new Date();
        const hoursSinceLastTap = (now - lastTap) / (1000 * 60 * 60);

        if (hoursSinceLastTap >= 24) {
            setDisabled(false);
            setStatusText('Tap to claim 10,000 points!');
            setStatusColor('var(--success-color)');
        } else {
            setDisabled(true);
            const nextTap = new Date(lastTap.getTime() + 24 * 60 * 60 * 1000);
            const hoursLeft = Math.ceil((nextTap - now) / (1000 * 60 * 60));
            setStatusText(`Come back in ${hoursLeft} hours`);
            setStatusColor('var(--text-secondary)');
        }
    };

    const handleTap = async (e) => {
        if (disabled) {
            toast.error(statusText);
            return;
        }

        // Optimistic UI updates could go here, but let's wait for API
        const result = await api.tapCoin(user.id);

        if (result.success) {
            setIsTapped(true);
            setTimeout(() => setIsTapped(false), 600);

            // Show floating points (simplified version using toast for now, or we can add DOM element)
            showFloatingPoints(e.currentTarget);

            toast.success(result.message);

            // Update context
            updateStats({ lastCoinTap: new Date().toISOString() });
            refreshPoints(user.id);
        } else {
            toast.error(result.message);
        }
    };

    const showFloatingPoints = (element) => {
        // Barebones implementation of floating points
        // In React, we might want a portal or a dedicated component, 
        // but manipulating DOM directly for this one-off effect is akin to the original script.
        const floatingPoints = document.createElement('div');
        floatingPoints.className = 'floating-points';
        floatingPoints.textContent = '+10,000';

        const rect = element.getBoundingClientRect();
        floatingPoints.style.left = (rect.left + rect.width / 2) + 'px';
        floatingPoints.style.top = (rect.top + rect.height / 2) + 'px';

        document.body.appendChild(floatingPoints);

        setTimeout(() => {
            floatingPoints.remove();
        }, 1500);
    };

    return (
        <div className="coin-section">
            <h3>Daily Rewards</h3>
            <p className="coin-subtitle">Tap the coin to earn 10,000 points daily!</p>
            <div className="coin-container">
                <div
                    className={`coin ${disabled ? 'disabled' : ''} ${isTapped ? 'tapped' : ''}`}
                    id="dailyCoin"
                    onClick={handleTap}
                >
                    <div className="coin-inner">
                        <div className="coin-front">
                            <div className="coin-symbol">₹</div>
                            <div className="coin-shine"></div>
                        </div>
                        <div className="coin-back">
                            <div className="coin-symbol">₹</div>
                        </div>
                    </div>
                </div>
                <div className="coin-status" style={{ color: statusColor }}>{statusText}</div>
            </div>
        </div>
    );
};

export default DailyCoin;
