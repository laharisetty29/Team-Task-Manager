import { useEffect, useState } from 'react';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import { FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? tasks
    : filter === 'overdue'
      ? tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done')
      : tasks.filter(t => t.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="filter-bar">
        <FiFilter />
        {['all', 'todo', 'in-progress', 'review', 'done', 'overdue'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found for this filter.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;