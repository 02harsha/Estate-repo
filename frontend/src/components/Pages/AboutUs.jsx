import React from 'react';
import Header from '../Dashboard/Header';

const AboutUs = () => {
    return (
        <div className="page-container">
            <Header />
            <div className="content-wrapper" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', marginTop: "6rem" }}>About 100CRORECLUB MNC</h1>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                        Welcome to 100CRORECLUB MNC, your premier destination for premium real estate investments and opportunities.
                        We are dedicated to revolutionizing the way people invest in property, making it accessible, transparent, and profitable for everyone.
                    </p>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Our mission is to empower individuals to build wealth through strategic real estate partnerships.
                        With a focus on high-value assets and sustainable growth, we bring you the best opportunities in the market.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
