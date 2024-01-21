const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "aca7d292",
  apiSecret: "YPq9g2gmPs3tcCXI"
})

const from = "19025952717"

async function sendSMS(to, text) {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

module.exports = sendSMS;