const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employeeValidators');

router.use(protect);

router.get('/', authorize('admin', 'hr'), getEmployees);
router.post('/', authorize('admin', 'hr'), validate(createEmployeeSchema), createEmployee);
router.get('/:id', getEmployee); // access-checked inside controller
router.put('/:id', validate(updateEmployeeSchema), updateEmployee); // access-checked inside controller
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
