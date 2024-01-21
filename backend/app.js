import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Passage from '@passageidentity/passage-node';
import userDrugManagerRouter from './routes/userDrugManager.js';
import { sendSMS, setNotificationPeriod} from './smsService.js';
import { Models as dbModels, Functions as dbFunctions } from "./utils/db.js";
const { UserDrugCollection } = dbModels;



// Construct __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const port = process.env.PORT || 3000;

let auth = false;

console.log("auth: " + auth);

app.get('/:page(index|)', (req, res) => {
  console.log("Accessed /index.html");
  if (!auth) {
    console.log("inauth");
    res.redirect('/signin.html');
  } else {
    console.log("authed");
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
    auth = true;
  }
});

// Route for /signin.html
app.get('/signin.html', (req, res) => {
  console.log("Accessed /signin.html");
  auth = true;
  res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});

// Route for /profile.html
app.get('/profile', (req, res) => {
  console.log("Accessed /profile.html");
  res.sendFile(path.join(__dirname, '../frontend/profile.html'));
  auth = true;
});

app.use("/userDrugManager", userDrugManagerRouter);

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
  // Assuming the user's name is stored in the 'name' property
  const userName = user.id || "unknown user";

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
 
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
  await getInfo(userID);
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
    const userName = user.user_metadata.full_name || "User";

    res.json({ name: userName });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/getUserID', passageAuthMiddleware, async (req, res) => {
  try {
    const userID = res.userID;
    const user = await passage.user.get(userID);

    // Assuming the user's name is stored in the 'name' property
    const userName = user.id || "unknown user";

    res.json({ name: userName });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server user.Error' });
  }
});

// app.use('/api/getTableData', userDrugRouter);

app.get('/api/getTableData', passageAuthMiddleware, async (req, res) => {
  console.log("getting table data lol");
  try {
    const userID = res.userID;
    const user = await passage.user.get(userID);

    const userName = user.id 
    
    // const userDrugResponse = await fetch(`http://your-api-domain/api/userDrugManager?userId=${userName}`);
    console.log(`http://localhost:3000/userDrugManager?userId=${userName}`);
    const userDrugResponse = await fetch(`http://localhost:3000/userDrugManager?userId=${userName}`);
    if (userDrugResponse.ok) {
      const userDrugData = await userDrugResponse.json();
      console.log('User Drug Data:', userDrugData);


      // Return the combined data
      res.json(userDrugData);
    } else {
      console.error('Error fetching user drug data:', userDrugResponse.status, userDrugResponse.statusText);
      res.status(500).json({ error: 'Internal Server Error' });
    }
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
app.get('/newrx', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/newrx.html'));
});

app.get('/signout', passageAuthMiddleware, async (req, res) => {
  try {
    console.log('Before sign out');
    const user = res.userID;

    passage.user.signOut(user);

    console.log('After sign out');

    // Redirect to the sign-in page or any other appropriate page after signing out
    res.redirect('/signin.html');
  } catch (error) {
    console.error('Error during sign-out:', error);
    // Handle the error appropriately, e.g., redirect to an error page
    res.redirect('/error.html');
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  console.error(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function getInfo(userID) {
  let userDrug
  let phoneNumber = '17789380866'
  let first_name
  try {
    let user = await passage.user.get(userID);
    const full_name = user.user_metadata.full_name;
    // phoneNumber = user.phone;
    first_name = full_name.replace(/ .*/,'');
  } catch (error) {
    console.error('Error fetching user name:', error);
  }
  const filter = { userId: userID };
  userDrug = await dbFunctions.dbFindRecord(UserDrugCollection, filter);
  if (!userDrug) {
    console.log('Record not found.');
  }
  else if (userDrug.drugs === null) {
    console.log("no drugs")
  }
  else {
  let drugNames = []
  let endTimes = []
  let frequencies = []
  for (let i = 0; i < userDrug.drugs.length; i++) {
    drugNames.push(userDrug.drugs[i].drugName);
    endTimes.push(userDrug.drugs[i].expiryDate);
    let numberMatch = userDrug.drugs[i].instruction.match(/\d+/);
    console.log("Number match: " + numberMatch)
    let frequency;
    if (numberMatch) {
      frequency = parseInt(numberMatch[0]); // change this
      console.log("Frequency: " + frequency);
    }
    frequencies.push(frequency);
  }
  // test
  const now = new Date();
  endTimes[0] = now.setHours(now.getHours() + 24)
  console.log("endTimes[0]" + endTimes[0])
  // set notifications for each drug
  for (let i = 0; i < userDrug.drugs.length; i++) {
    if (!(frequencies === null || phoneNumber === null || endTimes === null)) {
      setNotificationPeriod(frequencies[i], drugNames[i], endTimes[i], phoneNumber, first_name)
    }
  }
  }
}

export default app;