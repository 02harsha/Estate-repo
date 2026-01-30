import React, { useEffect, useState } from 'react';

const PointsCard = ({ points }) => {
    const [displayPoints, setDisplayPoints] = useState(0);
    const [timeLeft, setTimeLeft] = useState({
        days: 180,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Points animation
    useEffect(() => {
        let start = displayPoints;
        const end = points;
        if (start === end) return;

        const duration = 1000;
        const steps = 50;
        const increment = (end - start) / steps;
        const stepDuration = duration / steps;

        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            setDisplayPoints(Math.floor(current));
        }, stepDuration);

        return () => clearInterval(timer);
    }, [points]);

    // Countdown Timer Logic (Simulating 180 days countdown)
    // Countdown Timer Logic
    useEffect(() => {
        // Set Launch Date (Today: 2026-01-30)
        const LAUNCH_DATE = new Date('2026-01-30T00:00:00');
        const TARGET_DATE = new Date(LAUNCH_DATE);
        TARGET_DATE.setDate(TARGET_DATE.getDate() + 180); // 180 days from launch

        const timer = setInterval(() => {
            const now = new Date();
            const difference = TARGET_DATE - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => time.toString().padStart(2, '0');

    return (
        <div className="points-card">
            <div className="points-content">
                <div className="points-left">
                    <h3>Your Points</h3>
                    <div className="points-value">
                        <span className="points-number">{displayPoints.toLocaleString()}</span>
                        <span className="points-label">Points</span>
                    </div>
                </div>
                <div className="points-right">
                    <p className="countdown-label">Offer Ends In</p>
                    <div className="countdown-timer">
                        <div className="timer-unit">
                            <span className="timer-value">{formatTime(timeLeft.days)}</span>
                            <span className="timer-label">Days</span>
                        </div>
                        <div className="timer-separator">:</div>
                        <div className="timer-unit">
                            <span className="timer-value">{formatTime(timeLeft.hours)}</span>
                            <span className="timer-label">Hours</span>
                        </div>
                        <div className="timer-separator">:</div>
                        <div className="timer-unit">
                            <span className="timer-value">{formatTime(timeLeft.minutes)}</span>
                            <span className="timer-label">Minutes</span>
                        </div>
                        <div className="timer-separator">:</div>
                        <div className="timer-unit">
                            <span className="timer-value">{formatTime(timeLeft.seconds)}</span>
                            <span className="timer-label">Seconds</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointsCard;
