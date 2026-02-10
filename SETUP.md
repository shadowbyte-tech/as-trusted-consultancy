# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and set your values:
# - GEMINI_API_KEY: Your Google Gemini API key
# - JWT_SECRET: A strong random string (change from default!)
```

### 3. Initialize Data Files
The application will automatically create data files on first run. No manual setup needed.

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

### 5. Default Login Credentials

**Owner Account:**
- Email: `swamy@consult.com`
- Password: `password`

**User Account:**
- Email: `user@consult.com`
- Password: `password`

**⚠️ IMPORTANT**: Change these passwords immediately after first login!

## Environment Variables Explained

### Required Variables

#### `GEMINI_API_KEY`
- **Purpose**: Enables AI features (Vastu analysis, plot descriptions, market insights, etc.)
- **How to get**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Example**: `AIzaSyCOozivH0cLJJE0l37ZNfA1zxLYRnwJUYw`

#### `JWT_SECRET`
- **Purpose**: Signs and verifies JWT tokens for authentication
- **Security**: MUST be changed in production!
- **How to generate**: Use a strong random string (32+ characters)
- **Example**: `openssl rand -base64 32` (run in terminal)

#### `NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED`
- **Purpose**: Tells frontend if AI features are available
- **Value**: Set to `true` if GEMINI_API_KEY is configured
- **Example**: `true`

### Optional Variables

#### `NODE_ENV`
- **Purpose**: Specifies the environment
- **Values**: `development`, `production`, `test`
- **Default**: `development`

## File Structure

### Data Files (Auto-created)
```
src/lib/
├── plot-data.json          # Plot listings
├── inquiry-data.json       # Customer inquiries
├── registration-data.json  # User registrations
├── contact-data.json       # Contact information
├── user-data.json          # User accounts
└── password-data.json      # Password hashes (bcrypt)
```

### Configuration Files
```
.env                        # Your environment variables (DO NOT COMMIT)
.env.example               # Example environment file (safe to commit)
```

## Development Commands

```bash
# Start development server
npm run dev

# Start Genkit development UI (for AI flows)
npm run genkit:dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run typecheck
```

## First Time Setup Checklist

- [ ] Install Node.js (v18 or higher)
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Get Gemini API key from Google AI Studio
- [ ] Set `GEMINI_API_KEY` in `.env`
- [ ] Generate and set `JWT_SECRET` in `.env`
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:9002`
- [ ] Login with default credentials
- [ ] Change default passwords
- [ ] Test all features

## Troubleshooting

### "GEMINI_API_KEY not configured"
- Check that `.env` file exists
- Verify `GEMINI_API_KEY` is set in `.env`
- Verify `NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED=true` is set
- Restart the development server

### "Invalid credentials" on login
- Verify you're using the correct default credentials
- Check that `password-data.json` exists in `src/lib/`
- Try deleting `password-data.json` and restarting (will recreate with defaults)

### "Failed to read/write data"
- Check file permissions in `src/lib/` directory
- Ensure the application has write access
- Check disk space

### AI features not working
- Verify `GEMINI_API_KEY` is valid
- Check API quota/limits in Google AI Studio
- Check browser console for errors
- Verify `NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED=true`

### Port 9002 already in use
- Change port in `package.json`: `"dev": "next dev --turbopack -p YOUR_PORT"`
- Or stop the process using port 9002

## Security Recommendations

### Development
- ✅ Use default credentials for testing
- ✅ Keep `.env` file local (already in `.gitignore`)
- ✅ Use HTTPS in production

### Production
- ⚠️ **CRITICAL**: Change `JWT_SECRET` to a strong random string
- ⚠️ **CRITICAL**: Change all default passwords
- ⚠️ **CRITICAL**: Use environment variables, not `.env` file
- ⚠️ **CRITICAL**: Migrate to production database (PostgreSQL)
- ⚠️ Add rate limiting
- ⚠️ Add CSRF protection
- ⚠️ Enable HTTPS only
- ⚠️ Add security headers
- ⚠️ Implement proper logging and monitoring

## Next Steps

1. **Explore the Application**
   - Login as owner and user
   - Create plots, contacts, inquiries
   - Test AI features

2. **Customize**
   - Update branding and colors
   - Modify validation rules in `src/lib/constants.ts`
   - Add custom features

3. **Deploy**
   - See `IMPROVEMENTS.md` for production recommendations
   - Migrate to production database
   - Set up proper hosting (Vercel, AWS, etc.)

## Support

For issues or questions:
1. Check `IMPROVEMENTS.md` for detailed documentation
2. Review error messages in browser console
3. Check server logs in terminal
4. Verify environment variables are set correctly

## License

[Your License Here]
