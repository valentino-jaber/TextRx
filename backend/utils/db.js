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

module.exports = {UserDrugCollection};