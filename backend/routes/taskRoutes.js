const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskSchema, updateTaskSchema } = require('../validators/taskValidators');

router.use(protect);

router.get('/', getTasks);
router.post('/', authorize('admin', 'hr'), validate(taskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask); // access-checked inside controller
router.delete('/:id', authorize('admin', 'hr'), deleteTask);

module.exports = router;
