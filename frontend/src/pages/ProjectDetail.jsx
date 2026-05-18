import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import { FiPlus, FiArrowLeft, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const emptyTask = { title: '', description: '', assignedTo: '', status: 'todo', priority: 'medium', dueDate: '' };

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTask, setEditingTask] = useState(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
        api.get('/auth/users'),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskForm);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', { ...taskForm, project: id });
        toast.success('Task created!');
      }
      setShowTaskModal(false);
      setTaskForm(emptyTask);
      setEditingTask(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    });
    setShowTaskModal(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userId: memberUserId });
      toast.success('Member added!');
      setShowMemberModal(false);
      setMemberUserId('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const isOwner = project?.owner?._id === user?._id || user?.role === 'admin';
  const tasksByStatus = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'review': tasks.filter(t => t.status === 'review'),
    'done': tasks.filter(t => t.status === 'done'),
  };

  if (loading) return <div className="page"><div className="loading-text">Loading project...</div></div>;
  if (!project) return <div className="page"><p>Project not found.</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex-col">
          <button className="btn-back" onClick={() => navigate('/projects')}>
            <FiArrowLeft /> Projects
          </button>
          <h1>{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div className="header-actions">
          {isOwner && (
            <button className="btn-outline" onClick={() => setShowMemberModal(true)}>
              <FiUserPlus /> Add Member
            </button>
          )}
          <button className="btn-primary" onClick={() => { setEditingTask(null); setTaskForm(emptyTask); setShowTaskModal(true); }}>
            <FiPlus /> Add Task
          </button>
        </div>
      </div>

      <div className="members-bar">
        <span className="label">Team:</span>
        <span className="member-chip owner">{project.owner.name} (owner)</span>
        {project.members.map(m => (
          <span key={m.user._id} className="member-chip">{m.user.name}</span>
        ))}
      </div>

      <div className="kanban-board">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-label">{status.replace('-', ' ')}</span>
              <span className="kanban-count">{statusTasks.length}</span>
            </div>
            <div className="kanban-tasks">
              {statusTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {statusTasks.length === 0 && (
                <div className="kanban-empty">No tasks here</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleTaskSubmit} className="auth-form">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Member</h2>
            <form onSubmit={handleAddMember} className="auth-form">
              <div className="form-group">
                <label>Select User</label>
                <select value={memberUserId} onChange={e => setMemberUserId(e.target.value)} required>
                  <option value="">Choose a user</option>
                  {users
                    .filter(u => u._id !== project.owner._id && !project.members.find(m => m.user._id === u._id))
                    .map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)
                  }
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;