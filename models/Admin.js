// models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: String,
  password: String // store hashed password ideally
});

module.exports = mongoose.model('Admin', AdminSchema);
