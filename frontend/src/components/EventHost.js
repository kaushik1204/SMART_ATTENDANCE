import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { recognizeEventParticipant } from '../services/api';
import Navbar from './Navbar';

const EventHost = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [recognitions, setRecognitions] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [scannerSource, setScannerSource] = useState(null); // null, 'camera', 'upload'
    const [uploadedImages, setUploadedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (scannerSource === 'camera') {
            startCamera();
        }
        return () => stopCamera();
    }, [scannerSource]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Camera access denied. Please enable camera permissions.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setIsStreaming(false);
    };

    const captureFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || loading) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            setLoading(true);
            const formData = new FormData();
            formData.append('image', blob, 'frame.jpg');

            try {
                const response = await recognizeEventParticipant(formData);
                setRecognitions(response.data.matches || []);
            } catch (err) {
                console.error("Recognition error:", err);
            } finally {
                setLoading(false);
            }
        }, 'image/jpeg', 0.8);
    }, [loading]);

    useEffect(() => {
        let interval;
        if (isStreaming) {
            interval = setInterval(captureFrame, 2000); // 2 second interval
        }
        return () => clearInterval(interval);
    }, [isStreaming, captureFrame]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Navbar />
            <main style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Hosting Event</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Live recognition active</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                    {/* Main Content Area */}
                    <div style={{
                        position: 'relative',
                        background: '#000',
                        borderRadius: 'var(--radius-2xl)',
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        boxShadow: 'var(--shadow-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {!scannerSource && (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'var(--bg-card)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2rem'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>AI Scanner Ready</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>Choose an input source to begin</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <button
                                        onClick={() => setScannerSource('camera')}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '2rem',
                                            background: 'var(--bg-secondary)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xl)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            width: '160px'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                    >
                                        <div style={{
                                            fontSize: '32px',
                                            marginBottom: '1rem',
                                        }}>
                                            📷
                                        </div>
                                        <span style={{ fontWeight: '600' }}>Live Camera</span>
                                    </button>

                                    <button
                                        onClick={() => document.getElementById('file-upload').click()}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '2rem',
                                            background: 'var(--bg-secondary)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xl)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            width: '160px'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                    >
                                        <div style={{
                                            fontSize: '32px',
                                            marginBottom: '1rem',
                                        }}>
                                            📤
                                        </div>
                                        <span style={{ fontWeight: '600' }}>Upload Photos</span>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                if (e.target.files?.length > 0) {
                                                    const files = Array.from(e.target.files);
                                                    const imageUrls = files.map(file => URL.createObjectURL(file));
                                                    setUploadedImages(imageUrls);
                                                    setScannerSource('upload');
                                                    setLoading(true);
                                                    setRecognitions([]); // Clear previous

                                                    // Process all files
                                                    const allMatches = [];
                                                    for (const file of files) {
                                                        const formData = new FormData();
                                                        formData.append('image', file);
                                                        try {
                                                            const res = await recognizeEventParticipant(formData);
                                                            if (res.data.matches) {
                                                                allMatches.push(...res.data.matches);
                                                            }
                                                        } catch (err) {
                                                            console.error("Error recognizing file:", file.name, err);
                                                        }
                                                    }

                                                    // Filter duplicates based on name
                                                    const uniqueMatches = Array.from(new Map(allMatches.map(item => [item.name, item])).values());
                                                    setRecognitions(uniqueMatches);
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {scannerSource === 'camera' && (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(5, 150, 105, 0.8)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '2rem',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ height: '8px', width: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                                    LIVE RECOGNITION
                                </div>
                            </>
                        )}

                        {scannerSource === 'upload' && uploadedImages.length > 0 && (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                overflowY: 'auto',
                                padding: '1rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '1rem',
                                alignContent: 'start'
                            }}>
                                {uploadedImages.map((imgUrl, idx) => (
                                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1' }}>
                                        <img
                                            src={imgUrl}
                                            alt={`Uploaded ${idx}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-color)'
                                            }}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => document.getElementById('add-more-upload').click()}
                                    style={{
                                        aspectRatio: '1/1',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '2px dashed var(--border-color)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                        e.currentTarget.style.color = 'var(--color-primary)';
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>+</div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Add More</span>
                                </button>
                                <input
                                    id="add-more-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        if (e.target.files?.length > 0) {
                                            const newFiles = Array.from(e.target.files);
                                            const newImageUrls = newFiles.map(file => URL.createObjectURL(file));

                                            setUploadedImages(prev => [...prev, ...newImageUrls]);
                                            setLoading(true);

                                            const newMatches = [];
                                            for (const file of newFiles) {
                                                const formData = new FormData();
                                                formData.append('image', file);
                                                try {
                                                    const res = await recognizeEventParticipant(formData);
                                                    if (res.data.matches) {
                                                        newMatches.push(...res.data.matches);
                                                    }
                                                } catch (err) {
                                                    console.error("Error recognizing file:", file.name, err);
                                                }
                                            }

                                            setRecognitions(prev => {
                                                const allMatches = [...prev, ...newMatches];
                                                const uniqueMatches = Array.from(new Map(allMatches.map(item => [item.name, item])).values());
                                                return uniqueMatches;
                                            });
                                            setLoading(false);
                                        }
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(99, 102, 241, 0.8)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '2rem',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    zIndex: 10
                                }}>
                                    🖼️ BATCH ANALYSIS
                                </div>
                            </div>
                        )}

                        {scannerSource && (
                            <button
                                onClick={() => {
                                    setScannerSource(null);
                                    stopCamera();
                                    setUploadedImages([]);
                                    setRecognitions([]);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '1rem',
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(4px)',
                                    fontSize: '18px'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Recognition Log */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-2xl)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recognized Participants</h2>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, maxHeight: '500px' }}>
                            {recognitions.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                        {scannerSource === 'upload' ? '🖼️' : '🔍'}
                                    </div>
                                    <p>{scannerSource === 'upload' ? (loading ? 'Analyzing photos...' : 'Upload photos to analyze') : 'Scanning for participants...'}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recognitions.map((match, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '1rem',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-lg)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                animation: 'fadeInUp 0.3s ease-out'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>{match.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Confidence: {(match.confidence * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div style={{
                                                height: '10px',
                                                width: '10px',
                                                background: 'var(--color-success)',
                                                borderRadius: '50%'
                                            }}></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => navigate('/events')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Stop Session
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventHost;
