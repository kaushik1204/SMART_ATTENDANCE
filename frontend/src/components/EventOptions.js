import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const EventOptions = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Register for Event',
            description: 'New participant? Enroll your name and face to be recognized during the event.',
            path: '/events/register',
            icon: '📝',
            color: 'var(--color-accent)'
        },
        {
            title: 'Host Event',
            description: 'Start the live recognition session to mark attendance for registered participants.',
            path: '/events/host',
            icon: '🎥',
            color: 'var(--color-primary)'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Navbar />
            <main style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Events Portal</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                        Manage your event participation and attendance seamlessly
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {roles.map((role, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(role.path)}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-2xl)',
                                padding: '2.5rem',
                                cursor: 'pointer',
                                transition: 'all var(--transition-base)',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                                e.currentTarget.style.borderColor = role.color;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            <div style={{
                                fontSize: '3.5rem',
                                marginBottom: '1.5rem',
                                height: '100px',
                                width: '100px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                {role.icon}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{role.title}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                {role.description}
                            </p>
                            <span style={{
                                color: role.color,
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                Get Started →
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        ← Back to Main Page
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EventOptions;
