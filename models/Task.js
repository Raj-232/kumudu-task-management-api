const mongoose = require('mongoose');

const TASK_PRIORITIES = ['Low', 'Medium', 'High'];
const TASK_STATUSES = ['Pending', 'In Progress', 'Done'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'Medium',
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'Pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);


