const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks with optional filters
// @route   GET /api/tasks
// @access  Public
const getTasks = async (req, res, next) => {
  try {
    const { status, project, priority, tag, search } = req.query;

    const tasks = await Task.find({
      status,
      project,
      priority,
      tag,
      search
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public / Private
const createTask = async (req, res, next) => {
  try {
    const { title, project, due, priority, tag, status, description, assignee, aiGenerated } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    if (!project || project.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const task = await Task.create({
      title: title.trim(),
      project: project.trim(),
      due: due || 'Today',
      priority: priority || 'Medium',
      tag: tag || 'Engineering',
      status: status || 'todo',
      description: description || '',
      assignee: assignee || (req.user ? req.user.name : 'Anubhav Yadav'),
      aiGenerated: !!aiGenerated
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task / toggle status
// @route   PUT /api/tasks/:id or PATCH /api/tasks/:id
// @access  Public / Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public / Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for tasks and workload
// @route   GET /api/tasks/stats/summary
// @access  Public
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.getStats();
    const projects = await Project.find();

    const projectsOnTrack = projects.filter(p => (p.progress || 0) >= 50).length;

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        totalProjects: projects.length,
        projectsOnTrack,
        focusTime: '4h 32m'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
