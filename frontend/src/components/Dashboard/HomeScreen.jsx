import React, { useEffect } from 'react';
import Header from './Header';
import PointsCard from './PointsCard';
import DailyCoin from './DailyCoin';
import ReferralSection from './ReferralSection';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = () => {
    const { user, refreshPoints,refreshReferralStats } = useAuth();

    useEffect(() => {
        refreshPoints(user.id);
        refreshReferralStats(user.id);
    }, []);

    return (
        <div id="homeScreen" className="screen active">
            <Header />
            <div className="home-container">
                <PointsCard points={user.points} />
                <DailyCoin />
                <ReferralSection />
            </div>
        </div>
    );
};

export default HomeScreen;
