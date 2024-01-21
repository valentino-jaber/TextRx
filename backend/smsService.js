import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: "aca7d292",
  apiSecret: "YPq9g2gmPs3tcCXI"
});

const from = "19025952717";

const sendSMS = async (to, text) => {
  try {
    const response = await vonage.message.sendSms(from, to, text);
    console.log('Message sent successfully');
    console.log(response);
  } catch (error) {
    console.error('There was an error sending the messages.');
    console.error(error);
  }
};

const sendNotification = async (phoneNumber, text, interval, stopAfterDuration) => {
  const timerId = setInterval(() => sendSMS(phoneNumber, text), interval);
  setTimeout(() => {
    clearInterval(timerId);
    console.log('Notification interval stopped.');
  }, stopAfterDuration);
  setTimeout(() => clearInterval(timerId), stopAfterDuration);
};

export { sendSMS, sendNotification };
