# MongoDB Migration Guide

## Overview
This guide helps you migrate from JSON file-based storage to MongoDB Atlas for production deployment on Netlify.

## Why MongoDB?
Netlify has a read-only filesystem, which means JSON file storage doesn't work for write operations (creating plots, registrations, etc.). MongoDB Atlas provides a cloud database solution that works perfectly with serverless deployments.

## Prerequisites
- MongoDB Atlas account (free tier available)
- MongoDB connection string
- Node.js installed locally

## Step 1: MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string

## Step 2: Configure Environment Variables

### Local Development (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### Netlify Deployment
1. Go to your Netlify site settings
2. Navigate to "Environment variables"
3. Add `MONGODB_URI` with your connection string
4. Add other required variables:
   - `GEMINI_API_KEY`
   - `JWT_SECRET`

## Step 3: Migrate Existing Data (Optional)

If you have existing data in JSON files, run the migration script:

```bash
node scripts/migrate-to-mongodb.js
```

This will transfer all data from:
- `src/lib/plot-data.json`
- `src/lib/user-data.json`
- `src/lib/password-data.json`
- `src/lib/registration-data.json`
- `src/lib/inquiry-data.json`
- `src/lib/contact-data.json`

## Step 4: Test Locally

```bash
npm run dev
```

Test all CRUD operations:
- Create a plot
- Delete a plot
- Submit a registration
- Create a contact
- etc.

## Step 5: Deploy to Netlify

```bash
git add .
git commit -m "Migrate to MongoDB Atlas"
git push origin main
```

Netlify will automatically deploy your changes.

## Verification

After deployment, test these operations on your live site:
1. Submit a registration form
2. Create a plot (owner dashboard)
3. Delete a plot
4. Create a contact

All operations should now work without "Internal Error" messages.

## Troubleshooting

### Connection Errors
- Verify your MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### Data Not Showing
- Run the migration script if you have existing data
- Check MongoDB Atlas dashboard to verify data exists

### Build Errors
- Ensure all environment variables are set in Netlify
- Check build logs for specific error messages

## Database Collections

Your MongoDB database will have these collections:
- `plots` - Property listings
- `users` - User accounts
- `passwords` - Hashed passwords
- `registrations` - User registrations
- `inquiries` - Plot inquiries
- `contacts` - Seller/Buyer contacts

## Security Notes

1. Never commit `.env` file to git
2. Use strong passwords for MongoDB users
3. Rotate JWT_SECRET in production
4. Keep MongoDB connection string secure
5. Use IP whitelisting when possible

## Support

If you encounter issues:
1. Check Netlify function logs
2. Verify MongoDB Atlas connection
3. Test locally first before deploying
