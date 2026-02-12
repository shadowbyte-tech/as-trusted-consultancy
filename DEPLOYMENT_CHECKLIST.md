# Deployment Checklist for Netlify

## ✅ Completed Steps

### 1. MongoDB Integration
- ✅ Installed `mongodb` and `mongoose` packages
- ✅ Created MongoDB connection utility (`src/lib/mongodb.ts`)
- ✅ Created Mongoose models for all collections (`src/lib/models.ts`)
- ✅ Created MongoDB database operations (`src/lib/mongodb-database.ts`)
- ✅ Updated all server actions to use MongoDB (`src/lib/actions.ts`)
- ✅ Updated password storage to use MongoDB (`src/lib/password-storage.ts`)
- ✅ Created migration script (`scripts/migrate-to-mongodb.js`)
- ✅ Created connection test script (`scripts/test-mongodb-connection.js`)
- ✅ Updated `.env.example` with MongoDB URI placeholder

## 🔧 MongoDB Atlas Setup Required

### Step 1: Verify MongoDB Cluster
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Ensure your cluster is running and active
3. Verify cluster name matches your connection string: `smkg.wc88qhm.mongodb.net`

### Step 2: Network Access
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. For testing: Add `0.0.0.0/0` (allows all IPs)
4. For production: Add your specific IPs or use Netlify's IP ranges

### Step 3: Database User
1. Go to "Database Access" in MongoDB Atlas
2. Verify user exists: `sukkamanikantagoud_db_user`
3. Ensure password is correct: `buddy@04`
4. Verify user has "Read and write to any database" permissions

### Step 4: Test Connection Locally
```bash
npm run test:mongodb
```

If successful, you should see:
```
✅ Successfully connected to MongoDB!
📊 Database: astc_database
```

## 📦 Netlify Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Migrate to MongoDB Atlas for production"
git push origin main
```

### Step 2: Configure Netlify Environment Variables
1. Go to your Netlify site dashboard
2. Navigate to: Site settings → Environment variables
3. Add these variables:

```
MONGODB_URI=mongodb+srv://sukkamanikantagoud_db_user:buddy%4004@smkg.wc88qhm.mongodb.net/astc_database?retryWrites=true&w=majority&appName=SMKG
GEMINI_API_KEY=AIzaSyA9JDIwiWwfmTMuS_Dn7CiiCWqnBkmW658
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
```

### Step 3: Deploy
Netlify will automatically deploy when you push to GitHub.

## 🧪 Testing After Deployment

Test these operations on your live site:

1. **Registration Form**
   - Go to homepage
   - Fill out registration form
   - Submit
   - Check owner dashboard → Registrations

2. **Create Plot**
   - Login as owner
   - Go to dashboard
   - Upload a new plot
   - Verify it appears in plots list

3. **Delete Plot**
   - Go to dashboard
   - Delete a plot
   - Verify it's removed

4. **Contact Management**
   - Create a new contact
   - Edit a contact
   - Delete a contact

## 🔍 Troubleshooting

### "Internal Error" on Netlify
- Check Netlify function logs
- Verify environment variables are set correctly
- Ensure MongoDB URI is properly URL-encoded

### Connection Timeout
- Verify IP whitelist in MongoDB Atlas
- Check if cluster is paused (free tier auto-pauses after inactivity)
- Test connection locally first

### Data Not Migrating
- Run migration script: `npm run migrate:mongodb`
- Check MongoDB Atlas dashboard to verify data exists
- Ensure JSON files exist in `src/lib/` directory

## 📝 Important Notes

1. **Password Encoding**: The `@` symbol in password is encoded as `%40`
2. **Database Name**: Using `astc_database` as specified
3. **Collections**: Will be created automatically on first write
4. **Indexes**: MongoDB will create default indexes

## 🔐 Security Recommendations

1. Change `JWT_SECRET` to a strong random string
2. Use IP whitelisting instead of `0.0.0.0/0` in production
3. Rotate MongoDB password periodically
4. Never commit `.env` file to git
5. Use Netlify's encrypted environment variables

## 📊 Migration Status

- **JSON File Storage**: ❌ Deprecated (doesn't work on Netlify)
- **MongoDB Atlas**: ✅ Implemented and ready
- **Local Testing**: ⚠️ Requires MongoDB connection
- **Production Ready**: ✅ Yes (after MongoDB Atlas setup)

## 🚀 Next Steps

1. Complete MongoDB Atlas network access setup
2. Test connection locally: `npm run test:mongodb`
3. Migrate existing data: `npm run migrate:mongodb` (if needed)
4. Push to GitHub
5. Configure Netlify environment variables
6. Deploy and test on live site
