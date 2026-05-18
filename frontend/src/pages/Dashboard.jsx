import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiList, FiEye, FiRefreshCw } from 'react-icons/fi';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/tasks/stats/dashboard'),
        api.get('/tasks'),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 6));
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const statCards = [
    { label: 'Total Tasks', value: stats?.total ?? '—', icon: <FiList />, color: '#6366f1' },
    { label: 'In Progress', value: stats?.inProgress ?? '—', icon: <FiClock />, color: '#3b82f6' },
    { label: 'Completed', value: stats?.done ?? '—', icon: <FiCheckCircle />, color: '#22c55e' },
    { label: 'Overdue', value: stats?.overdue ?? '—', icon: <FiAlertTriangle />, color: '#ef4444' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your task overview</p>
        </div>
        <button className="btn-outline" onClick={fetchData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label} style={{ '--accent': s.color }}>
            <div className="stat-icon" style={{ color: s.color, background: s.color + '18' }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '...' : s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2>Recent Tasks</h2>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : recentTasks.length === 0 ? (
        <div className="empty-state">
          <FiList size={48} />
          <p>No tasks yet. Create a project and add tasks!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {recentTasks.map((task) => (
            <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;