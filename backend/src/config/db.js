const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// File-based persistent fallback store when MongoDB is not connected
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, 'users.json');
const projectsFile = path.join(dataDir, 'projects.json');
const tasksFile = path.join(dataDir, 'tasks.json');

const readJSON = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultData;
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err.message);
  }
};

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI && mongoURI !== 'mongodb://localhost:27017/innovation_hacks') {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000
      });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB database successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, falling back to persistent storage engine:', err.message);
    }
  }
  console.log('📦 Using persistent file-backed JSON database engine at:', dataDir);
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  readJSON,
  writeJSON,
  usersFile,
  projectsFile,
  tasksFile
};
