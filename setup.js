const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function setupDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.username);
            process.exit(0);
        }

        // Create default admin user
        const adminUser = new User({
            username: 'admin',
            email: 'admin@portfolio.com',
            password: 'admin123', // Change this password!
            role: 'admin'
        });

        await adminUser.save();
        console.log('Default admin user created:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Setup error:', error);
        process.exit(1);
    }
}

setupDatabase();