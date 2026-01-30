import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Copy, Share2, Check, Clock, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferralSection = () => {
    const { user, updateStats } = useAuth();
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCopyPopup, setShowCopyPopup] = useState(false);

    const copyReferralCode = () => {
        if (!user.referralCode) return;
        navigator.clipboard.writeText(user.referralCode)
            .then(() => {
                setShowCopyPopup(true);
                setTimeout(() => setShowCopyPopup(false), 2000); // Auto close after 2s
            })
            .catch(() => toast.error('Failed to copy code'));
    };

    const shareReferral = async () => {
        const referralUrl = `${window.location.origin}/login?ref=${user.referralCode}`;
        const shareText = `Join RealEstate Pro and start earning rewards! Use my referral code: ${user.referralCode}\n\n${referralUrl}`;

        // Increment share count locally (backend synch pending implementation in API)
        // Original script only updated local stats
        // We'll update stats in context
        // db.incrementShareCount logic:
        const newTotal = (user.totalShares || 0) + 1;
        updateStats({ totalShares: newTotal });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join RealEstate Pro',
                    text: shareText,
                    url: referralUrl
                });
                toast.success('Shared successfully!');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setShowShareModal(true);
                }
            }
        } else {
            setShowShareModal(true);
        }
    };



    return (
        <div className="referral-section">
            <h3>Refer & Earn</h3>
            <p className="referral-subtitle">Share your code and earn 1,000,000 points per referral!</p>
            <div className="referral-card">
                <div className="referral-code-display">
                    <label>Your Referral Code</label>
                    <div className="code-box">
                        <span>{user.referralCode || 'LOADING...'}</span>
                        <button className="btn-copy" onClick={copyReferralCode} title="Copy to clipboard">
                            <Copy size={10} /> <span>Copy</span>
                        </button>
                    </div>
                </div>
                <button className="btn-share" onClick={shareReferral}>
                    <Share2 size={20} />
                    Share Referral Code
                </button>

                <div className="referral-stats">
                    <h4>Referral Statistics</h4>
                    <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="stat-item">
                            <div className="stat-value">{user.completedReferrals || 0}</div>
                            <div className="stat-label">Completed Referrals</div>
                        </div>
                    </div>
                </div>

                <div className="prizes-section" style={{ marginTop: '20px' }}>
                    <h3>Exclusive Clubs</h3>
                    <p className="prizes-subtitle">Unlock prestigious clubs by earning points!</p>

                    {(() => {
                        const CLUBS = [
                            { name: 'Bronze Club', threshold: 10000000, icon: '🥉' },      // 1 Cr
                            { name: 'Silver Club', threshold: 50000000, icon: '🥈' },      // 5 Cr
                            { name: 'Gold Club', threshold: 100000000, icon: '🥇' },       // 10 Cr
                            { name: 'Platinum Club', threshold: 250000000, icon: '💠' },   // 25 Cr
                            { name: 'Diamond Club', threshold: 500000000, icon: '💎' },    // 50 Cr
                            { name: 'Master Club', threshold: 750000000, icon: '👑' },     // 75 Cr
                            { name: 'Grandmaster Club', threshold: 1000000000, icon: '🏆' } // 100 Cr
                        ];

                        const currentPoints = user.points || 0;
                        const nextClubIndex = CLUBS.findIndex(club => currentPoints < club.threshold);
                        const nextClub = nextClubIndex !== -1 ? CLUBS[nextClubIndex] : null;
                        const pointsNeeded = nextClub ? nextClub.threshold - currentPoints : 0;

                        return (
                            <>
                                {nextClub ? (
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        border: '1px solid var(--border-color)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                            🚀 Earn <strong>{pointsNeeded.toLocaleString()}</strong> more points to join the <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{nextClub.name}</span>!
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        background: 'rgba(255, 215, 0, 0.1)',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        border: '1px solid gold',
                                        textAlign: 'center',
                                        color: 'gold'
                                    }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            🏆 You have reached the pinnacle! Welcome to the Grandmaster Club!
                                        </p>
                                    </div>
                                )}

                                <div className="prizes-grid">
                                    {CLUBS.map((club, index) => {
                                        const isUnlocked = currentPoints >= club.threshold;
                                        return (
                                            <div key={club.name} className={`prize-card ${isUnlocked ? '' : 'disabled'}`} style={{
                                                borderColor: isUnlocked ? 'var(--primary-color)' : 'var(--border-color)',
                                                background: isUnlocked ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--card-bg)'
                                            }}>
                                                <div className="prize-badge" style={{
                                                    background: isUnlocked ? 'var(--success-color)' : 'var(--text-secondary)'
                                                }}>
                                                    {isUnlocked ? 'Unlocked' : 'Locked'}
                                                </div>
                                                <div className="prize-icon">{club.icon}</div>
                                                <div className="prize-amount" style={{ fontSize: '1.2rem' }}>{(club.threshold / 10000000)} Crore Points</div>
                                                <div className="prize-label">{club.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {showShareModal && (
                <ShareModal
                    text={`Join RealEstate Pro and start earning rewards! Use my referral code: ${user.referralCode}\n\n${window.location.origin}/login?ref=${user.referralCode}`}
                    onClose={() => setShowShareModal(false)}
                />
            )}
            {showCopyPopup && (
                <CopySuccessPopup />
            )}
        </div>
    );
};

const CopySuccessPopup = () => (
    <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '20px 40px',
        borderRadius: '12px',
        border: '1px solid var(--primary-color)',
        zIndex: 3000,
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        animation: 'fadeInUp 0.3s ease-out'
    }}>
        <div style={{
            width: '50px',
            height: '50px',
            background: 'var(--success-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px auto'
        }}>
            <Check size={30} color="white" />
        </div>
        <h3 style={{ margin: '0 0 5px 0', color: 'white' }}>Copied!</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Referral Code copied to clipboard</p>
    </div>
);

const ShareModal = ({ text, onClose }) => {
    const shareOptions = [
        { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(text)}` },
        { name: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(text)}` },
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
        { name: 'Email', url: `mailto:?subject=Join RealEstate Pro&body=${encodeURIComponent(text)}` }
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 2000
        }} onClick={onClose}>
            <div style={{
                background: 'var(--card-bg)', borderRadius: '20px', padding: '30px',
                maxWidth: '400px', width: '90%', border: '1px solid var(--border-color)'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Share via</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {shareOptions.map(option => (
                        <a key={option.name} href={option.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'block', padding: '15px', background: 'var(--dark-bg)',
                            borderRadius: '10px', color: 'var(--text-primary)', textDecoration: 'none'
                        }}>
                            {option.name}
                        </a>
                    ))}
                </div>
                <button onClick={onClose} style={{
                    width: '100%', marginTop: '15px', padding: '12px',
                    background: 'var(--danger-color)', color: 'white', border: 'none',
                    borderRadius: '10px', cursor: 'pointer'
                }}>Close</button>
            </div>
        </div>
    );
};

export default ReferralSection;
