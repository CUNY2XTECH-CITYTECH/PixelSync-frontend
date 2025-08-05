const path = require('path');
const express = require('express');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Point to your FRONTEND views folder
app.set('views', path.join(__dirname, '../PixelSync-frontend/views'));

// Example route (adjust as needed)
app.get('/auth', (req, res) => {
    res.render('auth'); // Looks for auth.ejs in the above directory
});
app.get('/test', (req, res) => {
    res.render('test'); // Create test.ejs to check if rendering works
});