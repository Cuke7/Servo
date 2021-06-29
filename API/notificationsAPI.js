var express = require("express");
var router = express.Router();

const rp = require("request-promise");
const webpush = require("web-push");

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
    let ID = req.query.ID;
    let text = req.query.text;

    // var message = {
    //     app_id: "749c8162-608c-4937-bb4f-0747f4e845a2",
    //     contents: { en: "English Message" },
    //     include_player_ids: ["fc8fc6fa-8235-4674-a694-390ee5fd5fe9"],
    // };

    var message = {
        app_id: "749c8162-608c-4937-bb4f-0747f4e845a2",
        contents: { en: text },
        include_player_ids: [ID],
    };

    sendNotification(message);
    resp.json("The notification may have been sent.");
}

var sendNotification = function (data) {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers,
    };

    var https = require("https");
    var req = https.request(options, function (res) {
        res.on("data", function (data) {
            // console.log("Response:");
            // console.log(JSON.parse(data));
        });
    });

    req.on("error", function (e) {
        console.log("ERROR:");
        console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();
};

module.exports = router;
