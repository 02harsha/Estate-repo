import React from 'react';
import Header from '../Dashboard/Header';

const Contact = () => {
    return (
        <div className="page-container">
            <Header />
            <div className="content-wrapper" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', marginTop: "6rem" }}>Contact Us</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ffd700' }}>Get in Touch</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Address</p>
                            <p>123 Business District, Financial Hub, City - 500001</p>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Email</p>
                            <p>info@100croreclub.com</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Phone</p>
                            <p>+91 98765 43210</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ffd700' }}>Send us a Message</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" placeholder="Your Name" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '1rem', borderRadius: '8px', color: 'white' }} />
                            <input type="email" placeholder="Your Email" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '1rem', borderRadius: '8px', color: 'white' }} />
                            <textarea placeholder="Message" rows="4" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '1rem', borderRadius: '8px', color: 'white' }}></textarea>
                            <button type="button" style={{ background: '#ffd700', color: 'black', padding: '1rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send Message</button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
