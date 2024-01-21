const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://wuj7:6UJhxwFJxIiVrZ7j@nwhacks2024.d8lmoos.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const drug = new mongoose.Schema({
    drugName: String,
    expiryDate: Date,
    quantity: Number,
    instruction: String
})

const userDrugs = new mongoose.Schema({
    userId: String,
    drugs: [drug]
})

const UserDrugCollection = mongoose.model('user_drug_collection', userDrugs);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("We're connected to MongoDB!");
});

// Utility Functions
const dbFindRecord = async (model, filter) => {
    let record = await model.findOne(filter);
    return record;
  }
  
  const dbFindAllRecords = async (model, filter) => {
    let records = await model.find(filter);
    return records;
  }
  
  const dbUpdateOne = async (model, filter, update) => {
    let record = await model.updateOne(filter, update);
    return record;
  }
  
  const dbSaveRecord = async (record) => {
    await record.save();
  }
  
  const dbDeleteRecord = async (record) => {
    await record.deleteOne();
  }

module.exports = {
    Models: {
        UserDrugCollection
    },
    Functions: {
        dbFindRecord, dbFindAllRecords, dbUpdateOne, dbSaveRecord, dbDeleteRecord
    }
};