const Task = require('../models/Task');
const logger = require('../utils/logger');

// Create a task for the logged-in user
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      userId: req.user._id,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    logger.error('Error in createTask controller', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tasks for the logged-in user with filtering, sorting, and pagination
const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const sortOptions = {};
    const validSortFields = ['createdAt', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sortOptions).skip(skip).limit(pageSize),
      Task.countDocuments(query),
    ]);

    res.json({
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      tasks,
    });
  } catch (error) {
    logger.error('Error in getTasks controller', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single task by ID (must belong to user)
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    logger.error('Error in getTaskById controller', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task (only if it belongs to the user)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, description, priority, status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    logger.error('Error in updateTask controller', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task (only if it belongs to the user)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteTask controller', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};


