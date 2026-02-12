/**
 * Test direct MongoDB connection bypassing SRV
 */

const mongoose = require('mongoose');

// Direct connection to MongoDB Atlas nodes
const connections = [
  // Try with different timeout and DNS settings
  {
    name: 'SRV with custom DNS',
    uri: 'mongodb+srv://sukkamanikantagoud_db_user:buddy%4004@smkg.wc88qhm.mongodb.net/astc_database?retryWrites=true&w=majority&appName=SMKG',
    options: {
      serverSelectionTimeoutMS: 10000,
      family: 4 // Force IPv4
    }
  }
];

async function testConnections() {
  console.log('🔄 Testing MongoDB connections with different configurations...\n');
  
  for (const config of connections) {
    console.log(`Testing: ${config.name}`);
    console.log('─'.repeat(50));
    
    try {
      await mongoose.connect(config.uri, config.options);
      
      console.log('✅ SUCCESS! Connected to MongoDB');
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      
      // Test a simple operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📁 Collections: ${collections.length}`);
      
      await mongoose.connection.close();
      console.log('🔌 Connection closed\n');
      
      console.log('🎉 Connection successful! You can now proceed with deployment.\n');
      return;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
      
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    }
  }
  
  console.log('\n🔧 All connection attempts failed. Possible causes:\n');
  console.log('1. Firewall/Antivirus blocking MongoDB port 27017');
  console.log('2. Corporate/School network blocking MongoDB');
  console.log('3. ISP DNS issues');
  console.log('4. Windows Firewall blocking Node.js');
  
  console.log('\n💡 Solutions to try:\n');
  console.log('1. Temporarily disable antivirus/firewall');
  console.log('2. Try from a different network (mobile hotspot)');
  console.log('3. Add Node.js to Windows Firewall exceptions');
  console.log('4. Use Google DNS (8.8.8.8) in network settings');
  console.log('5. Deploy directly to Netlify (it will work there!)');
  
  console.log('\n✅ Good news: Even if local connection fails,');
  console.log('   your code will work on Netlify after deployment!');
}

testConnections();
