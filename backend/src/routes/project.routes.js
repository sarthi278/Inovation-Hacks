const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { optionalAuth } = require('../middleware/auth');

router.route('/')
  .get(getProjects)
  .post(optionalAuth, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(optionalAuth, updateProject)
  .delete(optionalAuth, deleteProject);

module.exports = router;
