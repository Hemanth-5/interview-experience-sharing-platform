const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  webpack: {
    plugins: {
      add: [
        // Only apply obfuscation in production builds
        ...(process.env.NODE_ENV === 'production' ? [
          new WebpackObfuscator({
            // Basic obfuscation options
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            
            // Variable and function name obfuscation
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            renameProperties: false,
            renamePropertiesMode: 'safe',
            
            // Control flow obfuscation
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            
            // Anti-debugging and domain protection
            debugProtection: true,
            debugProtectionInterval: 2000,
            disableConsoleOutput: true,
            
            // Performance settings
            compact: true,
            simplify: true,
            
            // Exclude certain files from obfuscation
            excludes: [
              '**/node_modules/**',
              '**/public/**'
            ],
            
            // Advanced options
            selfDefending: true,
            unicodeEscapeSequence: false,
            
            // Preserve some functionality
            reservedNames: [
              '^React',
              '^ReactDOM',
              '^_',
              '^$'
            ],
            
            // Transformation options
            transformObjectKeys: true,
            numbersToExpressions: true,
            splitStrings: true,
            splitStringsChunkLength: 10
          }, [
            // Apply to all JS files except excluded ones
            '**/*.js',
            '!**/node_modules/**',
            '!**/public/**'
          ])
        ] : [])
      ]
    },
    configure: (webpackConfig) => {
      // Additional webpack configurations for production
      if (process.env.NODE_ENV === 'production') {
        // Remove source maps in production for extra security
        webpackConfig.devtool = false;
        
        // Minimize bundle size
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          minimize: true,
          sideEffects: false,
        };
        
        // Add additional security headers
        webpackConfig.output = {
          ...webpackConfig.output,
          crossOriginLoading: 'anonymous'
        };
      }
      
      return webpackConfig;
    }
  },
  
  // Additional CRACO configurations
  style: {
    css: {
      loaderOptions: {
        // Minimize CSS in production
        ...(process.env.NODE_ENV === 'production' && {
          minimize: true
        })
      }
    }
  }
};
