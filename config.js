const config = {
    development: {
        apiUrl: 'http://localhost:5000',
        domain: 'localhost'
    },
    production: {
        apiUrl: 'https://ppk2025.github.io/hole-in-one-resort', // GitHub Pages URL
        domain: 'ppk2025.github.io'
    }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment]; 