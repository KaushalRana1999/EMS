const Task = require('../models/Task');
const Employee = require('../models/Employee');

// @desc Get tasks - admin/hr see all (optionally filtered), employee sees only their own
// @route GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const query = {};
    const { status, assignedTo } = req.query;

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) return res.json({ success: true, count: 0, tasks: [] });
      query.assignedTo = employee._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc Create/assign a task (admin/hr)
// @route POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user._id });
    const populated = await task.populate([
      { path: 'assignedTo', select: 'firstName lastName employeeId' },
      { path: 'assignedBy', select: 'name email' }
    ]);
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Update a task (status update by employee, full update by admin/hr)
// @route PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || String(task.assignedTo) !== String(employee._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      // employees can only update status
      task.status = req.body.status || task.status;
    } else {
      Object.assign(task, req.body);
    }

    await task.save();
    const populated = await task.populate([
      { path: 'assignedTo', select: 'firstName lastName employeeId' },
      { path: 'assignedBy', select: 'name email' }
    ]);

    res.json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Delete task (admin/hr)
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
