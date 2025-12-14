require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Team = require('./models/Team');
const Event = require('./models/Event');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/sport-scheduler';

async function seed(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Seeding DB...');

  // admin
  const adminEmail = 'admin@gmail.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 12);
    admin = await User.create({ name: 'Admin', email: adminEmail, passwordHash: hash, role: 'admin' });
    console.log('Admin created: admin@gmail.com / admin123');
  } else {
    console.log('Admin already exists');
  }

  // teams
  await Team.deleteMany({});
  const teams = await Team.create([
    { name: 'Titans', players: [{ name:'Sam', position:'Forward' }], createdBy: admin._id },
    { name: 'Warriors', players: [{ name:'Lee', position:'Guard' }], createdBy: admin._id },
    { name: 'Strikers', players: [{ name:'Ava', position:'Mid' }], createdBy: admin._id }
  ]);
  console.log('Sample teams created');

  // events
  await Event.deleteMany({});
  const now = new Date();
  const events = [
    {
      title: 'City Football League',
      sport: 'Football',
      description: 'Local football league match day.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      time: '15:00',
      venue: 'Greenfield Stadium',
      teams: [teams[0]._id, teams[1]._id],
      createdBy: admin._id
    },
    {
      title: 'Intercollege Cricket Cup',
      sport: 'Cricket',
      description: 'Quarterfinals of the cricket cup.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20),
      time: '10:00',
      venue: 'City Cricket Ground',
      teams: [teams[1]._id, teams[2]._id],
      createdBy: admin._id
    },
    {
      title: 'City Basketball Championship',
      sport: 'Basketball',
      description: '3v3 playoff games.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
      time: '18:30',
      venue: 'Downtown Arena',
      teams: [teams[0]._id, teams[2]._id],
      createdBy: admin._id
    }
  ];
  await Event.create(events);
  console.log('Sample events created');

  mongoose.connection.close();
  console.log('Seeding complete. Bye.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
