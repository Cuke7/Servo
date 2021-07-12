var express = require("express");
var router = express.Router();

const fetch = require("node-fetch");

const Parser = require("rss-parser");
let parser = new Parser();

const firebase = require("firebase");
// Firebase config
let config = {
    apiKey: "AIzaSyDciTaq_4JN4uhy29PDTqCx36ukF6F290U",
    authDomain: "quotidiev2.firebaseapp.com",
    projectId: "quotidiev2",
    storageBucket: "quotidiev2.appspot.com",
    messagingSenderId: "518768548588",
    appId: "1:518768548588:web:ae8a64816d43a1eeab63c9",
    databaseURL: "https://quotidiev2-default-rtdb.europe-west1.firebasedatabase.app/",
};
firebase.initializeApp(config);

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app", "https://quotidie.fr/"];

//Endpoints
router.route("/send_notification").get(send_notification);

async function send_notification(req, resp) {
    // Allow CORS stuff
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    let feed = await parser.parseURL("https://rss.aelf.org/evangile");
    let evangile = {};
    evangile.title = "Title not found.";
    evangile.text = "Text not found.";
    if (feed.items.length == 1 || feed.items.length == 2) {
        evangile.title = feed.items[0].title;
        evangile.text = feed.items[0].content;
    } else {
        evangile.title = feed.items[3].title;
        evangile.text = feed.items[3].content;
    }

    var notification = {
        title: "Évangile du jour",
        body: evangile.title.substring(11),
        icon: "./quotidieIcon.png",
        click_action: "https://quotidie.fr/lectures",
    };

    //sendNotification(to);

    firebase
        .database()
        .ref("users")
        .once("value")
        .then(function (data) {
            if (data.val() == null) {
                console.log("no data");
            } else {
                console.log("Got data");
                data = Object.values(data.val());

                for (const person of data) {
                    if (person.notifications) {
                        sendNotification(person.key, notification);
                    }
                }
            }
        })
        .catch((err) => console.error(err));

    resp.send("Hello world!");
}

function sendNotification(to, notification) {
    var key = "AAAAeMkD2uw:APA91bHrKm9ow64TBkJEUDv_NNn-BnIm0sgC9WA7TEz5zKNyQONv2HS8iIHJ1XMuRR7-Pd4lSt2NBtkrUn7b5tEcQqi30z1WnfYj1nTh8hDDAvxXWEeIIo5fwbA-p916draSrpw_qO8f";

    fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
            Authorization: "key=" + key,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            notification: notification,
            to: to,
        }),
    })
        .then(function (response) {
            //console.log(response);
        })
        .catch(function (error) {
            console.error(error);
        });
}

module.exports = router;
