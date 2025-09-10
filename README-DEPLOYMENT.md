# Agriden Localhost Deployment Guide

This guide will help you deploy and run Agriden locally for development and testing.

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Clone and setup
git clone <your-repo>
cd Field-Buddy

# Setup environment
npm run dev:setup

# Install dependencies
npm install
```

### 2. Configure OAuth (Optional)
Edit `.env.local` and add your OAuth client IDs:
```bash
# Get these from Google Cloud Console and Azure Portal
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your-microsoft-client-id
```

### 3. Start Development Server
```bash
# Start with hot reload
npm run dev

# Or use standard Expo commands
npm start
npm run web
```

## 🌐 Localhost URLs

- **Web App**: http://localhost:19006
- **Dev Tools**: http://localhost:19002
- **Metro Bundler**: http://localhost:8081

## 📱 Mobile Testing

### Android
```bash
npm run android
# Or scan QR code with Expo Go app
```

### iOS (macOS only)
```bash
npm run ios
# Or scan QR code with Expo Go app
```

## 🏗️ Production Build

### Build for Web
```bash
# Build static files
npm run build

# Serve locally
npm run serve
# Opens at http://localhost:3000
```

### Build and Serve in One Command
```bash
npm run build:serve
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with setup |
| `npm run dev:setup` | Create .env.local from template |
| `npm run build` | Build web app for production |
| `npm run serve` | Serve built app locally |
| `npm run build:serve` | Build and serve in one command |
| `npm run clean` | Clean build artifacts |
| `npm run reset` | Clean and reinstall dependencies |

## 🔐 OAuth Setup for Localhost

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:19006/auth/google`
   - `http://localhost:3000/auth/google` (for production build)
6. Copy Client ID to `.env.local`

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Add redirect URIs:
   - `http://localhost:19006/auth/microsoft`
   - `http://localhost:3000/auth/microsoft` (for production build)
4. Copy Application ID to `.env.local`

## 📁 Project Structure

```
Field-Buddy/
├── app/                    # Expo Router pages
│   ├── auth/              # Authentication screens
│   └── (tabs)/            # Main app tabs
├── lib/                   # Core libraries
│   ├── auth.ts           # Authentication logic
│   ├── auth-context.tsx  # Auth React context
│   ├── db.ts             # SQLite database
│   ├── repos.ts          # Data repositories
│   └── usda-api.ts       # USDA API integration
├── scripts/              # Deployment scripts
│   ├── start-dev.js      # Development server
│   ├── build-web.js      # Web build
│   └── serve-local.js    # Local serving
├── .env.local            # Environment variables (create from env.example)
└── dist/                 # Built web files (generated)
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 19006
npx kill-port 19006
# Or use different port
npx expo start --web --port 3001
```

**OAuth redirect errors:**
- Check redirect URIs in OAuth console
- Ensure `.env.local` has correct client IDs
- Verify URLs match exactly (including http/https)

**Build failures:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Database issues:**
- SQLite database is created automatically
- Check file permissions in project directory
- Database file: `agriden.db` (or `agriden_dev.db` in dev mode)

### Environment Variables

All configuration is in `.env.local`:
- `EXPO_PUBLIC_*` variables are exposed to the client
- Never commit `.env.local` to version control
- Use `env.example` as a template

## 🚀 Deployment Options

### Static Web Hosting
1. Run `npm run build`
2. Upload `dist/` folder to:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]
```

## 📊 Features Available

✅ **Authentication**: SSO (Google, Microsoft, Apple) + Email/Phone  
✅ **Farm Management**: Crops, Tasks, Expenses  
✅ **USDA Integration**: Real API key, farm classification  
✅ **Offline Support**: SQLite + React Query persistence  
✅ **Weather Alerts**: Push notifications  
✅ **Mobile-First**: Responsive design  

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Query](https://tanstack.com/query/latest)
- [USDA QuickStats API](https://quickstats.nass.usda.gov/api)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft OAuth Setup](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
