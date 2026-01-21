const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkConnection = async () => {
    console.log('--- MongoDB Connection Check ---');
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error('❌ Error: MONGO_URI is missing in .env file');
        process.exit(1);
    }

    if (uri.includes('<username>') || uri.includes('<password>')) {
        console.error('❌ Error: MONGO_URI still contains placeholders (<username>, <password>)');
        console.log('   Please update backend/.env with your actual MongoDB credentials.');
        process.exit(1);
    }

    console.log(`Testing connection to: ${uri.split('@')[1] || 'URL'}`); // Hide credentials in log

    try {
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Database: ${mongoose.connection.name}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:');
        console.error(`   ${error.message}`);

        if (error.message.includes('bad auth')) {
            console.log('\n💡 Tip: Check your username and password in .env');
        } else if (error.message.includes('whitelist')) {
            console.log('\n💡 Tip: Whitelist your IP in MongoDB Atlas Network Access');
        }
        process.exit(1);
    }
};

checkConnection();
