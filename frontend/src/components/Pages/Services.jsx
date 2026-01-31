import React from 'react';
import Header from '../Dashboard/Header';

const Services = () => {
    return (
        <div className="page-container">
            <Header />
            <div className="content-wrapper" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', marginTop: "6rem" }}>Our Services</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ffd700' }}>Property Investment</h3>
                        <p>Expert guidance on high-yield property investments tailored to your portfolio goals.</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ffd700' }}>Asset Management</h3>
                        <p>Comprehensive management solutions to maximize the value and returns of your real estate assets.</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ffd700' }}>Consultancy</h3>
                        <p>Professional real estate consultancy for buyers, sellers, and investors navigating the market.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Services;
