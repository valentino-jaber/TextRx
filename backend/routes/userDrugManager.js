import express from 'express';
import { Models as dbModels, Functions as dbFunctions } from "../utils/db.js";
import bodyParser from 'body-parser';
import url from 'url';

const router = express.Router();
const { json, urlencoded } = bodyParser;

// Use json and urlencoded middlewares from bodyParser
router.use(json());
router.use(urlencoded({ extended: true }));


// Use body-parser middleware to parse request bodies
router.use(bodyParser.json())

// GET
router.get('/', async function(req, res, next) {
    try {
      let queriedUser = url.parse(req.url, true).query.userId;
      const userDrug = await dbModels.UserDrugCollection.find({userId: `${queriedUser}`});
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
    const userDrug = new dbModels.UserDrugCollection({ userId , drugs});
  
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
router.put('/remove-one', async (req, res) => {
  
      const userId = req.body.userId;
      let inputDrugs = req.body.drugs;
      const userDrugs = await dbFunctions.dbFindRecord(dbModels.UserDrugCollection, { userId });
      if (userDrugs == null) {
        console.log(`User with userId ${userId} not found`);
        res.status(404).send();
        return;
      } else {
        console.log("Get userId: " + userDrugs.userId);
      }
      let drugs = userDrugs.drugs;
  
      for (let drugName of inputDrugs) {
        
        console.log("Drug name: " + drugName);

        const drugIndex = drugs.findIndex((i) => i.drugName == drugName);
        if (drugIndex !== -1) {
          let drug = drugs[drugIndex];
          if (drug.quantity >= 1) {
            // Decrement count
            let newCount = drug.quantity - 1;
            console.log("new drug quantity " + newCount);
  
            let filter = {userId};
            let updateCount = {$set: {
              [`drugs.${drugIndex}.quantity`]: newCount
            }}
            await dbFunctions.dbUpdateOne(dbModels.UserDrugCollection, filter, updateCount);
          }
          
        } else {
          console.log(`Ingredient ${drugName} not found`);
        }
        
      }
  
      res.status(200).send("Successfully updated the database");
      return;
  
  });

export default router;