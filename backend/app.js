import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Passage from '@passageidentity/passage-node';
import userDrugManagerRouter from './routes/userDrugManager.js';
import { sendSMS, sendNotification } from './smsService.js';



// Construct __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
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

  let contact = userIdentifier;
  let phoneNum;
  if (contact.includes("@")) {
    console.log("email");
  } else {
    phoneNum = contact.replace(/\D/g, '');
    console.log(phoneNum);
    // sendSMS('17787918326', 'Hello from SMS service!');
    // sendNotification("17787918326", "Please take some pills", 10000, 50000);
  }


  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    console.log("authed");
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
    auth = true;
});

app.get('/api/getUserName', passageAuthMiddleware, async (req, res) => {
  try {
    const userID = res.userID;
    const user = await passage.user.get(userID);

    // Assuming the user's name is stored in the 'name' property
    const userName = user.user_metadata.full_name || user.email || user.phone;

    res.json({ name: userName });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

//route for camera pages
app.get('/camera', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/camera.html'));
});

app.use("/userDrugManager", userDrugManagerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
