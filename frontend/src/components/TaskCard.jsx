import { FiCalendar, FiUser, FiFlag, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { format, isPast } from 'date-fns';

const priorityColors = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#7c3aed',
};

const statusColors = {
  'todo': '#64748b',
  'in-progress': '#3b82f6',
  'review': '#f59e0b',
  'done': '#22c55e',
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <span
          className="task-priority"
          style={{ background: priorityColors[task.priority] + '22', color: priorityColors[task.priority] }}
        >
          <FiFlag size={11} /> {task.priority}
        </span>
        <div className="task-actions">
          {onEdit && (
            <button className="icon-btn" onClick={() => onEdit(task)}>
              <FiEdit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button className="icon-btn danger" onClick={() => onDelete(task._id)}>
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <h4 className="task-title">{task.title}</h4>
      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      <div className="task-meta">
        {task.assignedTo && (
          <span className="meta-item">
            <FiUser size={12} /> {task.assignedTo.name}
          </span>
        )}
        {task.dueDate && (
          <span className={`meta-item ${isOverdue ? 'text-red' : ''}`}>
            <FiCalendar size={12} />
            {format(new Date(task.dueDate), 'MMM dd')}
            {isOverdue && ' (overdue)'}
          </span>
        )}
      </div>

      <div className="task-card-footer">
        <select
          className="status-select"
          value={task.status}
          style={{ borderColor: statusColors[task.status] }}
          onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        {task.project?.name && (
          <span className="task-project">{task.project.name}</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;