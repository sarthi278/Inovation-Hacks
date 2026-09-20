const crypto = require('crypto');
const mongoose = require('mongoose');
const { isMongoConnected, readJSON, writeJSON, tasksFile } = require('../config/db');
const Project = require('./Project');

// Mongoose Schema (MongoDB)
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project: { type: String, required: true, trim: true },
  projectId: { type: String, default: '' },
  due: { type: String, default: 'Today' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  tag: { type: String, default: 'Engineering' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  done: { type: Boolean, default: false },
  assignee: { type: String, default: 'Anubhav Yadav' },
  assigneeAvatar: { type: String, default: 'AY' },
  aiGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoTaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);

class Task {
  static async find(filters = {}) {
    if (isMongoConnected()) {
      return MongoTaskModel.find(filters).sort({ createdAt: -1 });
    }

    let tasks = readJSON(tasksFile, []);

    if (filters.status) {
      if (filters.status === 'done') {
        tasks = tasks.filter(t => t.done || t.status === 'done');
      } else if (filters.status === 'todo') {
        tasks = tasks.filter(t => !t.done && t.status !== 'done');
      } else {
        tasks = tasks.filter(t => t.status === filters.status);
      }
    }

    if (filters.project) {
      tasks = tasks.filter(t => t.project === filters.project || t.projectId === filters.project);
    }

    if (filters.priority) {
      tasks = tasks.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
    }

    if (filters.tag) {
      tasks = tasks.filter(t => t.tag.toLowerCase() === filters.tag.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.project && t.project.toLowerCase().includes(q)) ||
        (t.tag && t.tag.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return tasks;
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongoTaskModel.findById(id);
    }
    const tasks = readJSON(tasksFile, []);
    return tasks.find(t => t.id === id || t._id === id || String(t.id) === String(id)) || null;
  }

  static async create(data) {
    const isDone = data.status === 'done' || !!data.done;
    const normalizedStatus = isDone ? 'done' : (data.status || 'todo');

    if (isMongoConnected()) {
      const task = new MongoTaskModel({
        ...data,
        status: normalizedStatus,
        done: isDone
      });
      const saved = await task.save();
      await Project.syncProjectProgress(data.project);
      return saved;
    }

    const tasks = readJSON(tasksFile, []);
    const newTask = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      project: data.project || 'General',
      projectId: data.projectId || '',
      due: data.due || 'Today',
      priority: data.priority || 'Medium',
      tag: data.tag || 'Engineering',
      status: normalizedStatus,
      done: isDone,
      assignee: data.assignee || 'Anubhav Yadav',
      assigneeAvatar: data.assigneeAvatar || (data.assignee ? data.assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AY'),
      aiGenerated: !!data.aiGenerated,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    writeJSON(tasksFile, tasks);
    await Project.syncProjectProgress(newTask.project);

    return newTask;
  }

  static async findByIdAndUpdate(id, updateData) {
    if (updateData.done !== undefined) {
      updateData.status = updateData.done ? 'done' : (updateData.status && updateData.status !== 'done' ? updateData.status : 'todo');
    } else if (updateData.status !== undefined) {
      updateData.done = updateData.status === 'done';
    }

    if (isMongoConnected()) {
      const updated = await MongoTaskModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (updated) await Project.syncProjectProgress(updated.project);
      return updated;
    }

    const tasks = readJSON(tasksFile, []);
    const index = tasks.findIndex(t => t.id === id || t._id === id || String(t.id) === String(id));
    if (index === -1) return null;

    const updated = {
      ...tasks[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    tasks[index] = updated;
    writeJSON(tasksFile, tasks);

    await Project.syncProjectProgress(updated.project);
    return updated;
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      const deleted = await MongoTaskModel.findByIdAndDelete(id);
      if (deleted) await Project.syncProjectProgress(deleted.project);
      return deleted;
    }

    const tasks = readJSON(tasksFile, []);
    const index = tasks.findIndex(t => t.id === id || t._id === id || String(t.id) === String(id));
    if (index === -1) return null;

    const [deleted] = tasks.splice(index, 1);
    writeJSON(tasksFile, tasks);

    await Project.syncProjectProgress(deleted.project);
    return deleted;
  }

  static async getStats() {
    const tasks = await this.find();
    const total = tasks.length;
    const completed = tasks.filter(t => t.done || t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress' && !t.done).length;
    const todo = tasks.filter(t => (!t.status || t.status === 'todo') && !t.done).length;
    const highPriority = tasks.filter(t => t.priority === 'High' && !t.done).length;

    return {
      total,
      completed,
      inProgress,
      todo,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

module.exports = Task;
