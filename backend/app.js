import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Passage from '@passageidentity/passage-node';
import userDrugManagerRouter from './routes/userDrugManager.js';
import { sendSMS, setNotificationPeriod} from './smsService.js';
import { Models as dbModels, Functions as dbFunctions } from "./utils/db.js";
import bodyParser from 'body-parser';

const { UserDrugCollection } = dbModels;



// Construct __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
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
  if (!auth) {
    console.log("inauth");
    res.redirect('/signin.html');
  } else {
    console.log("authed");
    res.sendFile(path.join(__dirname, '../frontend/profile.html'));
    auth = true;
  }
});

// Route for /newrx.html
app.get('/newrx', (req, res) => {
  console.log("Accessed /newrx.html");
  if (!auth) {
    console.log("inauth");
    res.redirect('/signin.html');
  } else {
    console.log("authed");
    res.sendFile(path.join(__dirname, '../frontend/newrx.html'));
    auth = true;
  }
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

app.get('/api/getInfo', passageAuthMiddleware, async (req, res) => {
  try {
    const userID = res.userID;
    const user = await passage.user.get(userID);

    // Assuming the user's name is stored in the 'name' property
    const userName = user.id || "unknown user";

    res.json({ name: userName, phoneNum: user.phone});
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server user.Error' });
  }
});

// app.use('/api/getTableData', userDrugRouter);

app.get('/api/getTableData', passageAuthMiddleware, async (req, res) => {
  try {
    const userID = res.userID;
    const user = await passage.user.get(userID);

    const userName = user.id 
    
    // const userDrugResponse = await fetch(`http://your-api-domain/api/userDrugManager?userId=${userName}`);
    const userDrugResponse = await fetch(`http://localhost:3000/userDrugManager?userId=${userName}`);
    if (userDrugResponse.ok) {
      const userDrugData = await userDrugResponse.json();

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

app.post('/api/process-drug-deletion', passageAuthMiddleware, async (req, res) => {
  try {
    const drugName = req.body.drugName;
    const userId = req.body.userId;
    console.log("Drug name received for processing: " + drugName);
    console.log("ID received for processing: " + userId);

    // Prepare the data to send in the DELETE request
    const data = {
      userId: userId,
      drugs: [drugName]
    };

    // Convert the data to a valid JSON string
    const jsonData = JSON.stringify(data);

    // Make a DELETE request to the other endpoint
    const deleteResponse = await fetch('http://localhost:3000/userDrugManager/remove-all', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonData, // Send the JSON data in the body
    });

    if (deleteResponse.ok) {
      const result = await deleteResponse.text();
      console.log('Result:', result);
      res.status(200).json({ message: 'Drug deleted successfully' });
    } else {
      console.error('Error in DELETE API call:', deleteResponse.status, deleteResponse.statusText);
      res.status(500).json({ error: 'Internal Server Error' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
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
  let phoneNumber
  let first_name
  try {
    let user = await passage.user.get(userID);
    const full_name = user.user_metadata.full_name;
    phoneNumber = user.phone;
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
    // console.log("Number match: " + numberMatch)
    let frequency;
    if (numberMatch) {
      frequency = parseInt(numberMatch[0]); 
    }
    frequencies.push(frequency);
  }
  // test
  // endTimes[0] = new Date(2024, 1, 24
  // set notifications for each drug
  for (let i = 0; i < userDrug.drugs.length; i++) {
    if (!(frequencies.includes(null) || phoneNumber === null || endTimes.includes(null))) {
      setNotificationPeriod(frequencies[i], drugNames[i], endTimes[i], phoneNumber, first_name)
    }
  }
  }
}

export default app;