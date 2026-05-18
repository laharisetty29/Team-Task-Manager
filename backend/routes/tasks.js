const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/tasks/stats/dashboard  ← MUST be before /:id
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const myTasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
      ],
    });
    const now = new Date();
    const stats = {
      total: myTasks.length,
      todo: myTasks.filter((t) => t.status === 'todo').length,
      inProgress: myTasks.filter((t) => t.status === 'in-progress').length,
      review: myTasks.filter((t) => t.status === 'review').length,
      done: myTasks.filter((t) => t.status === 'done').length,
      overdue: myTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
      ).length,
    };
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) {
      filter.project = req.query.project;
    } else {
      filter.$or = [
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate, tags } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!project) return res.status(400).json({ message: 'Project is required' });

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      tags,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');
    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const fields = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'tags'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    const updated = await task.save();
    await updated.populate('assignedTo', 'name email');
    await updated.populate('createdBy', 'name email');
    await updated.populate('project', 'name');
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;