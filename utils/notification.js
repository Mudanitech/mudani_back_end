var FCM = require('fcm-node');
// const request = require('request');
const fetch = require('node-fetch');
var serverKey = 'AAAAGZqz1bA:APA91bHsqnKeRpWAUwo6U1xC_j-_Ist-csH36XTloz5QZhPq6frP3w5Xhl1etppf-wq08MxGBWY1kGFgSnF1eBgh3KgJJ6xM0OTA5hpu2yzKX0DqCoUHcjlEL9BuWrMeUaJnnI15wwUI';
var fcm = new FCM(serverKey);

// var apn = require("apn"),
//     options, connection, notification;

const sendNotificationForAndroidOld = (deviceToken, title, msg, type, roomid, receiver, sender, fullName, desc, propertyTitle) => {
    console.log('chat noitificaiton')
    var message = {
        to: deviceToken,
        notification: {
            title: title,
            body: msg,
            type: type,
            roomid: roomid,
            receiver: receiver,
            sender: sender,
            fullName: fullName,
            desc: desc,
            propertyTitle: propertyTitle
        },
        data: {
            title: title,
            body: msg,
            type: type,
            roomid: roomid,
            receiver: receiver,
            sender: sender,
            fullName: fullName,
            desc: desc,
            propertyTitle: propertyTitle
        },
    };
    fcm.send(message, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            console.log(" ==========================chat notification sent successfully > ", response)
        }
    });
}

const sendNotificationForIos = (deviceToken, title, msg, type, roomid, receiver, sender, fullName, desc) => {
    console.log('-------------chat sendNotificationForIos')
    var options = {
        "cert": "PushDevRealEstate.pem",
        "key": "PushDevRealEstate.pem",
        "production": false
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = msg;
    note.alert = {
        title: title,
        body: msg
    }
    note.payload = {
        title: title,
        msg: msg,
        type: type,
        roomid,
        receiver,
        sender,
        fullName,
        desc
    };
    note.topic = "RealEstate.app";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is for chat=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })

};

const sendNotificationForAndroid = (deviceToken, msg, id, type, userType, userId) => {
    console.log('notification for andriois')
    var message = {
        to: deviceToken,
        // notification: {
        //     // title: title,
        //     body: msg,
        //     type: type
        // },
        data: {
            message: msg,
            id: id,
            type: type,
            userType: userType,
            userId: userId,
        },
    };
    console.log('notification for andriois 2')
    fcm.send(message, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            console.log(" ==========================Property notification sent successfully > ", response)
        }
    });
}

const propertyNotificationForIos = (deviceToken, msg, id, type, userId) => {
    var options = {
        "cert": "PushDevRealEstate.pem",
        "key": "PushDevRealEstate.pem",
        "production": false
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = msg;
    note.alert = {
        // title: title,
        body: msg
    }
    // note.payload = {title:title, msg: msg, type: type, roomid, receiver, sender, fullName, desc};
    note.payload = {
        msg: msg,
        id: id,
        type: type,
        userId
    };
    note.topic = "RealEstate.app";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is for chat=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })
}

const webNotification = () => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=AIzaSyCNRlmvXXJhkAtI6VEL7EW4s8Utcup7ZUM'
        },
        json: {
            "notification": {
                "title": "Hello World",
                "body": "This is Message from Admin",
                "icon": "https://mobulous.app/real/assets/img/Real-Estate-logo.png",
                "click_action": "http://18.191.90.186/properties/properties-details/5de247e9af62581121d9b059"
            },
            "to": "BCgCza73Zy_XiKeQaQ_DAFIQHEEd-WEBJD8Og27UL5D3gte-3lnnGrLelDVpBWU9gFMGgElqij5ajEozFHdD908"
        },
    };
    // request.post('https://fcm.googleapis.com/fcm/send', options, function (err, response) {
    //     if (err) {
    //         res.send(err)
    //     } else {
    //         res.send(response.body);
    //     }
    // });
    fetch.post('https://fcm.googleapis.com/fcm/send', options, function (err, response) {
        if (err) {
            res.send(err)
        } else {
            res.send(response.body);
        }
    });
}

module.exports = {
    sendNotificationForAndroidOld,
    sendNotificationForIos,
    sendNotificationForAndroid,
    propertyNotificationForIos,
    webNotification
}