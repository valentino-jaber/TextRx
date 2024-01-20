const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Define your API routes or other backend logic here

// Route for signin page
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});

// Route for signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

