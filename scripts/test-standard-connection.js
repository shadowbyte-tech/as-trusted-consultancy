/**
 * Test MongoDB connection with standard format (non-SRV)
 */

const mongoose = require('mongoose');

// Try standard connection format
const STANDARD_URI = 'mongodb://sukkamanikantagoud_db_user:buddy%4004@smkg-shard-00-00.wc88qhm.mongodb.net:27017,smkg-shard-00-01.wc88qhm.mongodb.net:27017,smkg-shard-00-02.wc88qhm.mongodb.net:27017/astc_database?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority';

async function testStandardConnection() {
  console.log('🔄 Testing standard MongoDB connection format...\n');
  console.log('Note: This is a fallback test. SRV format is preferred.\n');
  
  try {
    await mongoose.connect(STANDARD_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected successfully with standard format!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    
  } catch (error) {
    console.log('❌ Standard connection also failed:', error.message);
    console.log('\n🔧 This confirms the issue is likely:');
    console.log('   1. Cluster is paused or deleted');
    console.log('   2. Network access not configured');
    console.log('   3. Credentials are incorrect');
    console.log('\n💡 Please check MongoDB Atlas dashboard');
  }
}

testStandardConnection();
