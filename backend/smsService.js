const twilio = require('twilio');

const accountSid = 'AC04e2873aa9ee00b318e3137bf7d93e7e';
const authToken = 'abfdfbffbfa07163b0c144f492ff5ce5';
const client = twilio(accountSid, authToken);

function sendSMS(message, from, to) {
  return client.messages.create({
    body: message,
    from: from,
    to: to
  });
}

module.exports = {
  sendSMS
};
