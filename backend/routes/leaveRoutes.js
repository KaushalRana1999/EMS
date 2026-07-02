const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, reviewLeave, cancelLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { leaveSchema, reviewLeaveSchema } = require('../validators/leaveValidators');

router.use(protect);

router.get('/', getLeaves);
router.post('/', authorize('employee'), validate(leaveSchema), applyLeave);
router.put('/:id/review', authorize('admin', 'hr'), validate(reviewLeaveSchema), reviewLeave);
router.delete('/:id', cancelLeave); // access-checked inside controller

module.exports = router;
