import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Instant Session State
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantData, setInstantData] = useState({ subject: '', section: '' });

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStartDate, setWeekStartDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setWeekStartDate(monday);
  }, []);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStartDate);
    day.setDate(weekStartDate.getDate() + i);
    weekDays.push(day);
  }

  const handlePrevWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(newDate);
  };

  const handleDateClick = (date) => setCurrentDate(date);

  const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  const getDayNum = (date) => date.getDate();
  const getMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long' });
  const isSelected = (d1, d2) => d1.toDateString() === d2.toDateString();
  const isToday = (date) => date.toDateString() === new Date().toDateString();

  // Dashboard Data State
  const [profile, setProfile] = useState(null);
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const facultyId = localStorage.getItem('facultyId');
      if (!facultyId) {
        setError('Faculty ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await import('../services/api').then(m => m.getTeacherDashboardData(facultyId));
        setProfile(response.data.profile);
        setAllTimetables(response.data.timetable?.timetables || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getClassesForDate = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayData = allTimetables.find(t => t.day === dayName);
    if (!dayData) return [];
    return dayData.slots.map(slot => ({
      name: slot.subjectName,
      type: `${slot.type} ${slot.room}`,
      time: slot.time,
      section: slot.section,
      attendanceTaken: slot.attendanceTaken
    }));
  };

  const classes = getClassesForDate(currentDate);

  const handleClassClick = (className, section, time) => {
    navigate('/live-attendance', {
      state: {
        className: `${className} (${section})`,
        section: section,
        subjectName: className,
        time: time
      }
    });
  };

  // Stats
  const stats = [
    { label: 'Total Subjects', value: profile?.subjects?.length || '0', color: 'var(--color-primary)' },
    { label: 'Department', value: profile?.department || '---', color: 'var(--color-accent)' },
    { label: 'Academic Year', value: profile?.academicYear || '---', color: 'var(--color-success)' },
  ];

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Dashboard</h1>
            <p>Welcome back, {localStorage.getItem('teacherName') || 'Professor'}</p>
          </div>

          <div className="dashboard-header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Calendar & Actions Header */}
        <div className="schedule-header">
          <h2 className="schedule-title">Schedule</h2>

          <div className="schedule-actions">
            <div className="calendar-nav">
              <button onClick={handlePrevWeek} className="calendar-nav-btn">←</button>
              <span className="calendar-month">
                {getMonthName(weekStartDate)} {weekStartDate.getFullYear()}
              </span>
              <button onClick={handleNextWeek} className="calendar-nav-btn">→</button>
            </div>

            <button onClick={() => setShowInstantModal(true)} className="btn btn-primary">
              + Start Session
            </button>
          </div>
        </div>

        {/* Week Calendar */}
        <div className="week-calendar">
          {weekDays.map((day, idx) => {
            const selected = isSelected(day, currentDate);
            const today = isToday(day);
            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`day-btn ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
              >
                <div className="day-name">{getDayName(day)}</div>
                <div className="day-num">{getDayNum(day)}</div>
              </button>
            );
          })}
        </div>

        {/* Classes List */}
        <h2 className="classes-header">
          Classes for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h2>

        {loading && (
          <div className="card text-center p-8">
            <p className="text-muted">Loading timetable...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {!loading && !error && classes.length === 0 && (
          <div className="card text-center p-8">
            <p className="text-muted">No classes scheduled for this day.</p>
          </div>
        )}

        {!loading && !error && classes.length > 0 && (
          <div className="flex flex-col gap-3">
            {classes.map((cls, idx) => (
              <button
                key={idx}
                onClick={() => handleClassClick(cls.name, cls.section, cls.time)}
                className="class-card"
              >
                <div className="class-info">
                  <h3>{cls.name}</h3>
                  <div className="class-details">
                    <div className="class-detail-row">
                      <span>{cls.type}</span>
                      <span>{cls.time}</span>
                      <span>Section: {cls.section}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student-list/${encodeURIComponent(cls.name)}?section=${encodeURIComponent(cls.section)}`);
                      }}
                      className="view-analytics-btn"
                    >
                      View Student Analytics
                    </button>
                  </div>
                </div>
                <div className="class-action">
                  Start →
                </div>
                {cls.attendanceTaken && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    height: '10px',
                    width: '10px',
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    border: '2px solid var(--bg-card)',
                    boxShadow: '0 0 0 1px var(--color-success)',
                  }} title="Attendance Completed" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Instant Session Modal */}
      {showInstantModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Start Instant Session</h3>
              <button onClick={() => setShowInstantModal(false)} className="modal-close">&times;</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (instantData.subject && instantData.section) {
                  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  handleClassClick(instantData.subject, instantData.section, currentTime);
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={instantData.subject}
                    onChange={(e) => setInstantData({ ...instantData, subject: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. AIML-B"
                    value={instantData.section}
                    onChange={(e) => setInstantData({ ...instantData, section: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowInstantModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Start
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
