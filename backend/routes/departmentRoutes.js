const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { departmentSchema } = require('../validators/departmentValidators');

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.post('/', authorize('admin'), validate(departmentSchema), createDepartment);
router.put('/:id', authorize('admin'), validate(departmentSchema), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;
