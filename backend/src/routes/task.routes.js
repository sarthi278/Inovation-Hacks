const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { optionalAuth } = require('../middleware/auth');

router.get('/stats/summary', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(optionalAuth, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(optionalAuth, updateTask)
  .patch(optionalAuth, updateTask)
  .delete(optionalAuth, deleteTask);

module.exports = router;
