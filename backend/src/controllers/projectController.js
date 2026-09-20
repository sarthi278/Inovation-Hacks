const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with its tasks
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project not found with id ${req.params.id}`
      });
    }

    const tasks = await Task.find({ project: project.name });

    res.status(200).json({
      success: true,
      data: {
        ...project,
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Public / Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, color, collaborators } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || '',
      color: color || 'blue',
      collaborators: collaborators ? Number(collaborators) : 1,
      ownerId: req.user ? req.user.id : 'default-user'
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Public / Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Public / Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
