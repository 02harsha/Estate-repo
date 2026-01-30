import React, { useEffect, useState } from 'react';

const Particles = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Create 20 particles with random properties
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            width: Math.random() * 100 + 50 + 'px',
            left: Math.random() * 100 + '%',
            delay: Math.random() * 20 + 's',
            duration: (Math.random() * 10 + 15) + 's'
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="particles" id="particles">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        width: p.width,
                        height: p.width, // same as width
                        left: p.left,
                        animationDelay: p.delay,
                        animationDuration: p.duration
                    }}
                />
            ))}
        </div>
    );
};

export default Particles;
