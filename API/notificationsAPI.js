var express = require("express");
var router = express.Router();

const fetch = require("node-fetch");

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app"];

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

    var key = "AAAAeMkD2uw:APA91bHrKm9ow64TBkJEUDv_NNn-BnIm0sgC9WA7TEz5zKNyQONv2HS8iIHJ1XMuRR7-Pd4lSt2NBtkrUn7b5tEcQqi30z1WnfYj1nTh8hDDAvxXWEeIIo5fwbA-p916draSrpw_qO8f";

    var to = req.query.to;

    //var to = "fH6SY_jXHqsKmYh4YK9YsU:APA91bHDp2DuEM89L68XofFdlYR3ebqPiCMqGxeeTE3c7s6bHma3gJYCBRrIpgB1Sb3vx2pL5pys1v-rnJe9CywWbqgxhqKRjODuZiS4cam0CWiYoF27KzRuf5_65KQk6GmKyz26ktse";
    var notification = {
        title: "Portugal vs. Denmark",
        body: "5 to 1",
        icon: "firebase-logo.png",
        click_action: "http://localhost:8081",
    };

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

    resp.send("Hello world!")
}

module.exports = router;
