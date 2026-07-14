const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database.');

        await User.deleteMany({});
        await Club.deleteMany({});
        await Event.deleteMany({});
        await Registration.deleteMany({});
        console.log('Cleared existing data.');

        // Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const admin = await User.create({ name: 'Admin Boss', email: 'admin@uni.edu', password: hashedPassword, role: 'admin' });
        const faculty1 = await User.create({ name: 'Dr. Smith', email: 'smith@uni.edu', password: hashedPassword, role: 'faculty' });
        const faculty2 = await User.create({ name: 'Prof. Davis', email: 'davis@uni.edu', password: hashedPassword, role: 'faculty' });
        const student1 = await User.create({ name: 'Alice Student', email: 'alice@uni.edu', password: hashedPassword, role: 'student' });
        const student2 = await User.create({ name: 'Bob Student', email: 'bob@uni.edu', password: hashedPassword, role: 'student' });

        console.log('Users seeded. (Password for all: password123)');

        // Clubs
        const club1 = await Club.create({ name: 'Coding Club', description: 'For passionate developers.', president: student1._id, members: [student1._id, student2._id] });
        const club2 = await Club.create({ name: 'Robotics Society', description: 'Build and program robots.', president: student2._id, members: [student1._id, student2._id] });
        const club3 = await Club.create({ name: 'Cultural & Arts', description: 'Celebrate diversity and art.', president: student1._id, members: [student1._id] });

        console.log('Clubs seeded.');

        // Events
        const upcomingDate1 = new Date(); upcomingDate1.setDate(upcomingDate1.getDate() + 5);
        const upcomingDate2 = new Date(); upcomingDate2.setDate(upcomingDate2.getDate() + 10);
        const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 5);

        await Event.create([
            { title: 'Hackathon 2026', description: 'Annual hackathon.', date: upcomingDate1, time: '10:00', location: 'Main Hall', category: 'Technology', organizer: faculty1._id, club: club1._id, status: 'Approved', attendees: [student1._id] },
            { title: 'Robo Wars', description: 'Robot combat.', date: upcomingDate2, time: '14:00', location: 'Gymnasium', category: 'Technology', organizer: faculty2._id, club: club2._id, status: 'Approved', attendees: [student1._id, student2._id] },
            { title: 'Art Expo', description: 'Student art gallery.', date: pastDate, time: '17:00', location: 'Gallery', category: 'Cultural', organizer: faculty1._id, club: club3._id, status: 'Approved', attendees: [student1._id] },
            { title: 'Web Dev Workshop', description: 'Learn React.', date: upcomingDate1, time: '18:00', location: 'Lab 3', category: 'Technology', organizer: faculty1._id, club: club1._id, status: 'Approved', attendees: [] },
            { title: 'AI Ethics Panel', description: 'Discuss AI ethics.', date: upcomingDate2, time: '16:00', location: 'Auditorium', category: 'Academic', organizer: faculty2._id, status: 'Approved', attendees: [student2._id] },
            { title: 'Basketball Tryouts', description: 'Join the team.', date: upcomingDate1, time: '15:00', location: 'Court', category: 'Sports', organizer: faculty1._id, status: 'Pending', attendees: [] }
        ]);
        
        console.log('Events seeded.');

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
