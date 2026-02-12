/**
 * Diagnose MongoDB connection issues
 */

const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

const resolveSrv = promisify(dns.resolveSrv);
const resolve4 = promisify(dns.resolve4);

async function diagnose() {
  console.log('🔍 MongoDB Connection Diagnostics\n');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    return;
  }
  
  // Extract cluster hostname
  const match = MONGODB_URI.match(/@([^/]+)\//);
  if (!match) {
    console.error('❌ Could not parse cluster hostname from URI');
    return;
  }
  
  const cluster = match[1];
  console.log(`📡 Cluster hostname: ${cluster}\n`);
  
  // Test 1: DNS Resolution
  console.log('Test 1: DNS Resolution');
  console.log('─────────────────────');
  try {
    const srvRecord = `_mongodb._tcp.${cluster}`;
    console.log(`Resolving: ${srvRecord}`);
    const records = await resolveSrv(srvRecord);
    console.log('✅ DNS SRV records found:');
    records.forEach(r => {
      console.log(`   - ${r.name}:${r.port} (priority: ${r.priority})`);
    });
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.code);
    console.log('\n🔧 Possible causes:');
    console.log('   1. Cluster hostname is incorrect');
    console.log('   2. Cluster was deleted or renamed');
    console.log('   3. DNS server issues');
    console.log('   4. Internet connection problems');
    console.log('\n💡 Solution:');
    console.log('   1. Go to https://cloud.mongodb.com/');
    console.log('   2. Click "Database" → Find your cluster');
    console.log('   3. Click "Connect" → "Connect your application"');
    console.log('   4. Copy the NEW connection string');
    console.log('   5. Update MONGODB_URI in .env file');
    return;
  }
  
  // Test 2: Network Access
  console.log('\n\nTest 2: Network Access Check');
  console.log('─────────────────────────────');
  console.log('⚠️  Cannot verify from here. You must check MongoDB Atlas:');
  console.log('   1. Go to https://cloud.mongodb.com/');
  console.log('   2. Click "Network Access" (left sidebar)');
  console.log('   3. Ensure IP 0.0.0.0/0 is added (or your specific IP)');
  console.log('   4. Status should be "Active"');
  
  // Test 3: Cluster Status
  console.log('\n\nTest 3: Cluster Status');
  console.log('──────────────────────');
  console.log('⚠️  Cannot verify from here. You must check MongoDB Atlas:');
  console.log('   1. Go to https://cloud.mongodb.com/');
  console.log('   2. Click "Database" (left sidebar)');
  console.log('   3. Check cluster status - should be "Active" not "Paused"');
  console.log('   4. If paused, click "Resume"');
  
  console.log('\n\n✅ Diagnostics complete!');
}

diagnose().catch(console.error);
