const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// GET /api/projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, deadline, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      deadline,
      owner: req.user._id,
      members: members || [],
    });
    await project.populate('owner', 'name email');
    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (
      project.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, deadline, status, members } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (deadline !== undefined) project.deadline = deadline;
    if (status) project.status = status;
    if (members) project.members = members;

    const updated = await project.save();
    await updated.populate('owner', 'name email');
    await updated.populate('members.user', 'name email');
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (
      project.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/members
router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (
      project.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId, role } = req.body;
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email');
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;