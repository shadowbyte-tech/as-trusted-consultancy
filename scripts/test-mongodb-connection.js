/**
 * Test MongoDB connection
 * Run with: node scripts/test-mongodb-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections (${collections.length}):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Test a simple query
    const Plot = mongoose.model('Plot', new mongoose.Schema({}, { strict: false }));
    const plotCount = await Plot.countDocuments();
    console.log(`📈 Total plots: ${plotCount}`);
    
    console.log('\n✅ MongoDB connection test passed!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

testConnection();
