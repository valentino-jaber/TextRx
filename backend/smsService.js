import { Models as dbModels, Functions as dbFunctions } from "./utils/db.js";

import { Vonage } from '@vonage/server-sdk';
import schedule from 'node-schedule';

const vonage = new Vonage({
  apiKey: "aca7d292",
  apiSecret: "YPq9g2gmPs3tcCXI"
})

const from = "19025952717"

// Defines a day period
/*
const start = 
const end =*/

export async function sendSMS(to, text) {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

/*async function sendNotification(phoneNumber, text, interval, stopAfterDuration, ) {
  const timerId = setInterval(() => sendSMS(phoneNumber, text), interval);
  setTimeout(() => {
    clearInterval(timerId);
    console.log('Notification interval stopped.');
  }, stopAfterDuration); 
  setTimeout(() => clearInterval(timerId), stopAfterDuration); 
}*/

function sendNotification(phoneNumber, text, time, endTime) {
  
  const job = schedule.scheduleJob(time, function() {
    if (time.getTime() > endTime.getTime()) {
      console.log("Current time" + time + "is after finishing time" + endTime);
     }  
  else {
    sendSMS(phoneNumber, text);
  }
  })
}

// functions to generate array of notification times
function incrementSeconds(frequency, reminder, times, interval) {
  const SECOND = 1000;
  for (let i = 0; i < frequency; i++) {
    reminder.setTime(reminder.getTime() + interval * SECOND)
    times.push(new Date(reminder))
  }
}
function incrementMinutes(frequency, reminder, times, interval) {
  const MINUTE = 1000 * 60;
  for (let i = 0; i < frequency; i++) {
    reminder.setTime(reminder.getTime() + interval * MINUTE)
    times.push(new Date(reminder))
  }
}
function incrementHours(frequency, reminder, times, interval) {
  const HOUR = 1000 * 60 * 60;
  for (let i = 0; i < frequency; i++) {
    reminder.setTime(reminder.getTime() + interval * HOUR)
    times.push(new Date(reminder))
  }
}

// called each time a new prescription is added
export function setNotificationPeriod() {
  // values will be taken from db
  const frequency = 5000;
  const drugName = "Advil";
  let times = [];
  let endTime = new Date();
  endTime.setHours(endTime.getHours(endTime) + 24);
  const phoneNumber = "17789380866";
  const text = "Medication Reminder!\n \nTime for your " + drugName + ".\n \nStay healthy!";
  let reminder = new Date();
  // starting time set to 8 am
  reminder.setHours(8, 0, 0, 0);
  // 12 hour waking hours from 8 am to 8 pm
  let interval = 12 / (frequency + 1);
  // convert to the proper unit
  if (interval >= 1) {
    incrementHours(frequency, reminder, times, interval);
  }
  else {
    interval *= 60
    if (interval >= 1) {
      incrementMinutes(frequency, reminder, times, interval);
    }
    else {
      interval *= 60
      incrementSeconds(frequency, reminder, times, interval);
    }
  }
  
  // send all notifications in times array
  for (let i = 0; i < frequency; i++) {
    sendNotification(phoneNumber, text, times[i], endTime);
  }
}