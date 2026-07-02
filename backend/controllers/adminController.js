const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Task = require('../models/Task');

// @desc Dashboard analytics (counts + chart-ready data)
// @route GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [totalEmployees, totalDepartments, activeEmployees, pendingLeaves] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Leave.countDocuments({ status: 'pending' })
    ]);

    const departmentStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1, _id: 0 } }
    ]);

    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    const taskStats = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    const leaveStats = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      summary: { totalEmployees, totalDepartments, activeEmployees, pendingLeaves },
      departmentStats,
      roleStats,
      taskStats,
      leaveStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc Promote/demote a user's role
// @route PUT /api/admin/users/:id/role
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'hr', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc Activate/deactivate a user account
// @route PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc List all users (for role management screen)
// @route GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc Attendance / performance style report (HR)
// @route GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const employees = await Employee.find().populate('department', 'name');

    const report = await Promise.all(
      employees.map(async (emp) => {
        const [approvedLeaves, totalTasks, completedTasks] = await Promise.all([
          Leave.aggregate([
            { $match: { employee: emp._id, status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$days' } } }
          ]),
          Task.countDocuments({ assignedTo: emp._id }),
          Task.countDocuments({ assignedTo: emp._id, status: 'completed' })
        ]);

        return {
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department?.name || 'Unassigned',
          leaveBalance: emp.leaveBalance,
          leaveDaysTaken: approvedLeaves[0]?.total || 0,
          totalTasks,
          completedTasks,
          completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
      })
    );

    res.json({ success: true, count: report.length, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, changeUserRole, toggleUserStatus, getUsers, getReports };
