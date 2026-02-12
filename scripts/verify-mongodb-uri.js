/**
 * Verify and test MongoDB URI format
 */

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Analyzing MongoDB URI...\n');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// Parse the URI
const uriPattern = /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)\??(.*)/;
const match = MONGODB_URI.match(uriPattern);

if (!match) {
  console.error('❌ Invalid MongoDB URI format');
  console.log('\nExpected format:');
  console.log('mongodb+srv://username:password@cluster.mongodb.net/database?options');
  process.exit(1);
}

const [, username, password, cluster, database, options] = match;

console.log('✅ URI Format: Valid');
console.log(`📝 Username: ${username}`);
console.log(`🔒 Password: ${password.substring(0, 3)}***`);
console.log(`🌐 Cluster: ${cluster}`);
console.log(`📊 Database: ${database}`);
console.log(`⚙️  Options: ${options || 'none'}`);

console.log('\n📋 Checklist:');
console.log('1. Go to https://cloud.mongodb.com/');
console.log('2. Click "Database" in left sidebar');
console.log('3. Verify cluster exists and is ACTIVE (not paused)');
console.log(`4. Cluster hostname should match: ${cluster}`);
console.log('5. Click "Network Access" and add IP: 0.0.0.0/0');
console.log('6. Click "Database Access" and verify user exists');

console.log('\n💡 If cluster hostname is different:');
console.log('   - Click "Connect" on your cluster');
console.log('   - Choose "Connect your application"');
console.log('   - Copy the new connection string');
console.log('   - Update MONGODB_URI in .env file');

console.log('\n🔧 Common Issues:');
console.log('   - Cluster was deleted or renamed');
console.log('   - Cluster is paused (free tier auto-pauses)');
console.log('   - Network access not configured');
console.log('   - Firewall blocking port 27017');
