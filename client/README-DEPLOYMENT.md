# 🔒 PSG Tech Interview Hub - Obfuscated Frontend

This React application includes code obfuscation to protect the source code when deployed to production environments like Vercel.

## 🛡️ Security Features

### Code Obfuscation
- **String Array Encoding**: Strings are encoded and stored in arrays
- **Control Flow Flattening**: Code logic is flattened to make it harder to follow
- **Dead Code Injection**: Dummy code is injected to confuse reverse engineering
- **Variable Renaming**: All variables and functions are renamed to hexadecimal names
- **Anti-Debugging**: Includes detection and prevention of developer tools

### Additional Security Measures
- Source maps disabled in production
- Console output disabled
- Right-click context menu disabled
- Developer tools detection
- Security headers implementation

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Build (Obfuscated)
```bash
npm run build:obfuscated
```

### Vercel Deployment
1. Connect your repository to Vercel
2. Set build command to: `npm run build`
3. Set output directory to: `build`
4. Add environment variables in Vercel dashboard
5. Deploy!

## 📝 Environment Variables

### Required for Production
```env
REACT_APP_API_URL=https://your-backend-domain.com
GENERATE_SOURCEMAP=false
REACT_APP_DISABLE_DEV_TOOLS=true
```

## 🔧 Configuration Files

- `craco.config.js` - Webpack obfuscation configuration
- `vercel.json` - Vercel deployment settings with security headers
- `.env.production` - Production environment variables
- `build.sh` - Build script for deployment

## ⚠️ Important Notes

1. **Performance Impact**: Obfuscation adds ~20-30% to bundle size and may affect runtime performance slightly
2. **Development**: Obfuscation is only applied in production builds (NODE_ENV=production)
3. **Debugging**: Source maps are disabled in production for security
4. **Compatibility**: Tested with modern browsers, may not work with very old browsers due to security features

## 🛠️ Customizing Obfuscation

Edit `craco.config.js` to adjust obfuscation settings:
- Increase `controlFlowFlatteningThreshold` for stronger obfuscation
- Modify `stringArrayEncoding` options
- Add more reserved names if needed
- Adjust performance vs security trade-offs

## 📊 Build Analysis

After building, you can analyze the bundle size:
```bash
npm install -g source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

Note: This won't work in production due to disabled source maps, use only in development.
