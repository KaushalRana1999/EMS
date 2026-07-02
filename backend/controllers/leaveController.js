const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

const calcDays = (start, end) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(end) - new Date(start)) / msPerDay) + 1;
};

// @desc Get leaves - employees see own, admin/hr see all (filterable by status)
// @route GET /api/leaves
const getLeaves = async (req, res, next) => {
  try {
    const query = {};
    const { status } = req.query;

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) return res.json({ success: true, count: 0, leaves: [] });
      query.employee = employee._id;
    }
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

// @desc Apply for leave (employee)
// @route POST /api/leaves
const applyLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });

    const { startDate, endDate } = req.body;
    const days = calcDays(startDate, endDate);
    if (days <= 0) return res.status(400).json({ success: false, message: 'Invalid date range' });

    if (days > employee.leaveBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Available: ${employee.leaveBalance} day(s)`
      });
    }

    const leave = await Leave.create({ ...req.body, employee: employee._id, days });
    const populated = await leave.populate('employee', 'firstName lastName employeeId');
    res.status(201).json({ success: true, leave: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Approve/reject a leave request (admin/hr)
// @route PUT /api/leaves/:id/review
const reviewLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This leave request has already been reviewed' });
    }

    const { status, reviewComment } = req.body;
    leave.status = status;
    leave.reviewComment = reviewComment;
    leave.reviewedBy = req.user._id;
    await leave.save();

    if (status === 'approved') {
      await Employee.findByIdAndUpdate(leave.employee._id, {
        $inc: { leaveBalance: -leave.days }
      });
    }

    const populated = await leave.populate([
      { path: 'employee', select: 'firstName lastName employeeId' },
      { path: 'reviewedBy', select: 'name' }
    ]);

    res.json({ success: true, leave: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Cancel a pending leave request (employee, own only)
// @route DELETE /api/leaves/:id
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    if (req.user.role === 'employee' && String(leave.employee.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
    }

    await leave.deleteOne();
    res.json({ success: true, message: 'Leave request cancelled' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaves, applyLeave, reviewLeave, cancelLeave };
