import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Passage from '@passageidentity/passage-node';

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
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
    auth = true;
  }
});

// Route for /signin.html
app.get('/signin.html', (req, res) => {
  console.log("Accessed /signin.html");
  auth = true;
  res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});


//get user info:

let passage = new Passage({appID: 'w7Pn1nhzopfGmzRZhlDetRrN',
apiKey: 'mrb9H6pelI.rPryTQVHqfkDLa8r7fymRsqOvXv9JeH5EryBcxktpxfHIqc7UQrQqsVCYiZ0OOhX',});

let passageAuthMiddleware = (() => {
  return async (req, res, next) => {
    try {
      let userID = await passage.authenticateRequest(req);
      if (userID) {
        // user is authenticated
        res.userID = userID;
        next();
      }
    } catch (e) {
      console.log(e);
      res.render("unauthorized.hbs");
    }
  };
})();

app.get("/dashboard.html", passageAuthMiddleware, async (req, res) => {
  console.log("Accessed /index.html");
  let userID = res.userID;
  let user = await passage.user.get(userID);

  let userIdentifier;
  if (user.email) {
    userIdentifier = user.email;
  } else if (user.phone) {
    userIdentifier = user.phone;
  }
  // res.render("dashboard.hbs", { appID: process.env.PASSAGE_APP_ID });
  console.log("HERE");
  console.log(userIdentifier);
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    console.log("authed");
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
    auth = true;
});




// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
