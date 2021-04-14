const accountSid = 'AC7b38d9de5d6a6b554e53c60fa2072719';
const authToken = 'b724c3690be5b397be759d1291542bcd';
const client = require('twilio')(accountSid, authToken);

const sendSms = (to, userId) => client.messages
    .create({
        body: 'https://mudani.com/mudaniNew/#/refer-page/' + userId,
        from: '+14244071420',
        to: to
    })
    .then(message => console.log(message.sid));

const sendAppLink = (to) => client.messages
    .create({
        body: 'Play Store Link :- '+ 'https://play.google.com/store' +' , App Store :- '+'https://www.apple.com/in/app-store/',
        from: '+14244071420',
        to: to
    })
    .then(message => console.log(message.sid));
    

module.exports = {
    sendSms,
    sendAppLink
}