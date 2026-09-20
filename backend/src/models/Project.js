const crypto = require('crypto');
const mongoose = require('mongoose');
const { isMongoConnected, readJSON, writeJSON, projectsFile, tasksFile } = require('../config/db');

// Mongoose Schema (MongoDB)
const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  meta: { type: String, default: '' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  color: { type: String, default: 'blue' },
  initials: { type: String, default: 'PR' },
  ownerId: { type: String, default: 'default-user' },
  collaborators: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

class Project {
  static async find(query = {}) {
    if (isMongoConnected()) {
      return MongoProjectModel.find(query).sort({ updatedAt: -1 });
    }
    const projects = readJSON(projectsFile, []);
    return projects;
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongoProjectModel.findById(id);
    }
    const projects = readJSON(projectsFile, []);
    return projects.find(p => p.id === id || p._id === id) || null;
  }

  static async create(data) {
    const initials = data.initials || data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'PR';
    const color = data.color || ['coral', 'blue', 'green', 'purple'][Math.floor(Math.random() * 4)];

    if (isMongoConnected()) {
      const project = new MongoProjectModel({
        ...data,
        initials,
        color,
        meta: data.meta || `0 tasks · ${data.collaborators || 1} collaborator(s)`
      });
      return project.save();
    }

    const projects = readJSON(projectsFile, []);
    const newProject = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || '',
      meta: data.meta || `0 tasks · ${data.collaborators || 1} collaborator(s)`,
      progress: data.progress || 0,
      color,
      initials,
      ownerId: data.ownerId || 'default-user',
      collaborators: data.collaborators || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);
    writeJSON(projectsFile, projects);
    return newProject;
  }

  static async findByIdAndUpdate(id, updateData) {
    if (isMongoConnected()) {
      return MongoProjectModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }

    const projects = readJSON(projectsFile, []);
    const index = projects.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    const updated = {
      ...projects[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    projects[index] = updated;
    writeJSON(projectsFile, projects);
    return updated;
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongoProjectModel.findByIdAndDelete(id);
    }

    const projects = readJSON(projectsFile, []);
    const index = projects.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    const [deleted] = projects.splice(index, 1);
    writeJSON(projectsFile, projects);

    // Also delete associated tasks (cascade)
    const tasks = readJSON(tasksFile, []);
    const filteredTasks = tasks.filter(t => t.projectId !== id && t.project !== deleted.name);
    writeJSON(tasksFile, filteredTasks);

    return deleted;
  }

  // Recalculate progress for project based on task states
  static async syncProjectProgress(projectNameOrId) {
    const tasks = readJSON(tasksFile, []);
    const projectTasks = tasks.filter(t => t.projectId === projectNameOrId || t.project === projectNameOrId);
    if (projectTasks.length === 0) return;

    const completed = projectTasks.filter(t => t.done || t.status === 'done').length;
    const progress = Math.round((completed / projectTasks.length) * 100);
    const meta = `${projectTasks.length} task${projectTasks.length === 1 ? '' : 's'} · ${completed} done`;

    const projects = readJSON(projectsFile, []);
    const project = projects.find(p => p.id === projectNameOrId || p.name === projectNameOrId);
    if (project) {
      project.progress = progress;
      project.meta = meta;
      writeJSON(projectsFile, projects);
    }
  }
}

module.exports = Project;
