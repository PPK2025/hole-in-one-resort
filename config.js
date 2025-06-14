const config = {
    development: {
        apiUrl: 'http://localhost:5000',
        domain: 'localhost'
    },
    production: {
        // Render.com will automatically provide the URL
        apiUrl: process.env.RENDER_EXTERNAL_URL || 'https://hole-in-one-admin.onrender.com',
        domain: process.env.RENDER_EXTERNAL_URL ? new URL(process.env.RENDER_EXTERNAL_URL).hostname : 'hole-in-one-admin.onrender.com'
    }
};

// Determine environment
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// Export configuration
if (typeof window !== 'undefined') {
    // Browser environment
    window.config = currentConfig;
} else {
    // Node.js environment
    module.exports = currentConfig;
} 