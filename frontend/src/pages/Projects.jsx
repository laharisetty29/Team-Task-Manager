import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiPlus, FiFolder, FiTrash2, FiCalendar, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', deadline: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const statusColor = { active: '#22c55e', completed: '#6366f1', archived: '#94a3b8' };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Project
        </button>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card tall" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FiFolder size={48} />
          <p>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
              <div className="project-card-header">
                <div className="project-icon">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="project-header-right">
                  <span
                    className="status-badge"
                    style={{ background: statusColor[p.status] + '22', color: statusColor[p.status] }}
                  >
                    {p.status}
                  </span>
                  {(p.owner._id === user._id || user.role === 'admin') && (
                    <button
                      className="icon-btn danger"
                      onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="project-name">{p.name}</h3>
              {p.description && <p className="project-desc">{p.description}</p>}

              <div className="project-meta">
                <span className="meta-item"><FiUsers size={12} /> {p.members.length + 1} member{p.members.length !== 0 ? 's' : ''}</span>
                {p.deadline && (
                  <span className="meta-item">
                    <FiCalendar size={12} /> {format(new Date(p.deadline), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>

              <div className="project-owner">
                <span>by {p.owner.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Project</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What's this project about?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;