const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Updated Schema to match the provided API response
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    role: { 
        type: String, 
        enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], 
        default: 'USER' 
    },
    departmentId: { type: String, required: false }, // Set to true if mandatory
    status: { 
        type: String, 
        enum: ['ACTIVE', 'INACTIVE', 'PENDING'], 
        default: 'ACTIVE' 
    },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elegant-leather';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for seeding...');

        // Credentials based on your endpoint requirements
        const adminEmail = 'samicshakeel@elegantleather.com';
        const adminPassword = 'password'; 
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Super Admin already exists. Skipping seed.');
            return;
        }

        // Create Admin matching your JSON structure
        const admin = new User({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'samic',
            lastName: 'shakeel',
            username: 'samicshakeel',
            role: 'SUPER_ADMIN',
            departmentId: 'dept_001', // Example ID
            status: 'ACTIVE'
        });

        await admin.save();
        
        console.log('---------------------------------');
        console.log('Super Admin created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role: ${admin.role}`);
        console.log('---------------------------------');

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected.');
    }
}

seedAdmin();
