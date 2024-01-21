const express = require('express');
var router = express.Router();
var Models = require("../utils/db.js");
const bodyParser = require('body-parser');
var url = require('url');

// Use body-parser middleware to parse request bodies
router.use(bodyParser.json())

// GET
router.get('/', async function(req, res, next) {
    try {
      let queriedUser = url.parse(req.url, true).query.userId;
      const userDrug = await Models.UserDrugCollection.find({userId: `${queriedUser}`});
      console.log(typeof userDrug);
      console.log(userDrug);
      res.send(userDrug);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    } finally {
      console.log('Finished processing request');
    }
});

// POST
router.post('/upload', async (req, res) => {
    console.log("we got a POST request");
    const {userId, drugs} = req.body;
  
    // Create a new document
    const userDrug = new Models.UserDrugCollection({ userId , drugs});
  
    // Save the document to MongoDB
    try {
      await userDrug.save();
      res.status(200).send('Successfully saved to database');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error saving to database');
    }  
});

// PUT

// DELETE

module.exports = router;
