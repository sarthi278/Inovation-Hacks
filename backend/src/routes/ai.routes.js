const express = require('express');
const router = express.Router();
const {
  generateTasks,
  summarizeWorkload,
  generateProjectDescription
} = require('../controllers/aiController');

router.post('/generate-tasks', generateTasks);
router.post('/summarize', summarizeWorkload);
router.post('/project-description', generateProjectDescription);

module.exports = router;
