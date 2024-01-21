import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Construct __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

let auth = false;

console.log("auth: " + auth);

app.get('/:page(index|)', (req, res) => {
  console.log("Accessed /index.html");
  if (!auth) {
    console.log("inauth");
    res.redirect('/signin.html');
  } else {
    console.log("authed");
    res.sendFile(path.join(__dirname, './frontend/index.html'));
    auth = true;
  }
});

// Route for /signin.html
app.get('/signin.html', (req, res) => {
  console.log("Accessed /signin.html");
  auth = true;
  res.sendFile(path.join(__dirname, './frontend/signin.html'));
});

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, './frontend')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
