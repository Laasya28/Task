const Task = require('../models/Task');

// Get all tasks for user
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, subject, sortBy = 'dueDate' } = req.query;
    
    let filter = { userId: req.userId };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;

    let sortObj = {};
    if (sortBy === 'dueDate') sortObj = { dueDate: 1 };
    if (sortBy === 'priority') sortObj = { priority: -1 };
    if (sortBy === 'created') sortObj = { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortObj);
    
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, subject, tags } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }

    const task = new Task({
      userId: req.userId,
      title,
      description,
      dueDate,
      priority,
      subject,
      tags
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, subject, status, tags } = req.body;
    
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (subject) task.subject = subject;
    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }
    if (tags) task.tags = tags;

    task.updatedAt = new Date();
    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.userId });
    const completedTasks = await Task.countDocuments({ 
      userId: req.userId,
      status: 'completed'
    });
    const pendingTasks = await Task.countDocuments({ 
      userId: req.userId,
      status: { $ne: 'completed' }
    });
    
    const tasksByPriority = await Task.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const tasksBySubject = await Task.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByPriority,
        tasksBySubject
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reorder tasks (drag and drop)
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }

    for (let i = 0; i < tasks.length; i++) {
      await Task.findByIdAndUpdate(tasks[i]._id, { order: i });
    }

    res.json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: error.message });
  }
};
