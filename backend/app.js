const express = require('express');
const path = require('path');
const userDrugManagerRouter = require("./routes/userDrugManager.js");

const smsService = require('./smsService.js');

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

// Route for signup page
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

module.exports = app;

smsService.sendNotification("17789380866", "Please take some pills", 10000, 50000);