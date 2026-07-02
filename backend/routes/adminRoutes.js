const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  changeUserRole,
  toggleUserStatus,
  getUsers,
  getReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', authorize('admin', 'hr'), getAnalytics);
router.get('/users', authorize('admin'), getUsers);
router.put('/users/:id/role', authorize('admin'), changeUserRole);
router.put('/users/:id/status', authorize('admin'), toggleUserStatus);
router.get('/reports', authorize('admin', 'hr'), getReports);

module.exports = router;
