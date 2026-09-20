const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { isMongoConnected, readJSON, writeJSON, usersFile } = require('../config/db');

// Mongoose Schema (for MongoDB)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['developer', 'lead', 'admin'], default: 'developer' },
  avatar: { type: String, default: 'AY' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// Unified Model Interface
class User {
  static async findOne({ email, id }) {
    if (isMongoConnected()) {
      if (email) return MongoUserModel.findOne({ email });
      if (id) return MongoUserModel.findById(id);
    }
    const users = readJSON(usersFile, []);
    if (email) {
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    if (id) {
      return users.find(u => u.id === id || u._id === id) || null;
    }
    return null;
  }

  static async findById(id) {
    return this.findOne({ id });
  }

  static async find(filter = {}) {
    if (isMongoConnected()) {
      return MongoUserModel.find(filter).select('-password');
    }
    const users = readJSON(usersFile, []);
    return users.map(({ password, ...rest }) => rest);
  }

  static async create({ name, email, password, role = 'developer', avatar }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userAvatar = avatar || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DV';

    if (isMongoConnected()) {
      const user = new MongoUserModel({
        name,
        email,
        password: hashedPassword,
        role,
        avatar: userAvatar
      });
      const saved = await user.save();
      const userObj = saved.toObject();
      delete userObj.password;
      return userObj;
    }

    const users = readJSON(usersFile, []);
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('User with this email already exists');
      err.statusCode = 400;
      throw err;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      avatar: userAvatar,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(usersFile, users);

    const { password: _, ...userWithoutPass } = newUser;
    return userWithoutPass;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
