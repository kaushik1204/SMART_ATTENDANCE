import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerEventParticipant } from '../services/api';
import Navbar from './Navbar';

const EventRegister = () => {
    const [formData, setFormData] = useState({ name: '', photo: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('photo', formData.photo);

        try {
            await registerEventParticipant(data);
            setSuccess(`Successfully registered ${formData.name}!`);
            setFormData({ name: '', photo: null });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Navbar />
            <main style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{
                    background: 'var(--bg-card)',
                    padding: '3rem',
                    borderRadius: 'var(--radius-2xl)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', textAlign: 'center' }}>Event Registration</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Register your face for event participation</p>

                    {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Your Photo</label>
                            <div
                                onClick={() => document.getElementById('photo-input').click()}
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: 'var(--bg-secondary)',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                <input
                                    id="photo-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                                    style={{ display: 'none' }}
                                    required={!formData.photo}
                                />
                                {formData.photo ? (
                                    <div style={{ color: 'var(--color-success)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                                        <div style={{ fontWeight: '600' }}>{formData.photo.name}</div>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                        <div>Click to upload photo</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ padding: '1rem', width: '100%' }}
                        >
                            {loading ? 'Processing...' : 'Complete Registration'}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/events')}
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back to Options
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EventRegister;
