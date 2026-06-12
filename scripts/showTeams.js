require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../models/Team');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/sport-scheduler';

(async ()=>{
  try {
    await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 5000 });
    const teams = await Team.find().lean();
    console.log('Teams in DB:');
    console.log(JSON.stringify(teams, null, 2));
  } catch (err) {
    console.error('Error reading teams:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
})();
