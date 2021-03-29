var express = require("express");
var router = express.Router();

// Endpoints
router.route("/get_evangile").get(return_evangile_API);
router.route("/get_saint").get(return_saint_API);
router.route("/send_notifs").get(send_notifs);


const firebase = require("firebase");
const webpush = require("web-push");
const rp = require("request-promise");
const cheerio = require("cheerio");
const request = require("request");
const Parser = require("rss-parser");
let parser = new Parser();

const allowedOrigins = ["http://127.0.0.1:8000", "https://quotidie.netlify.app"];

// Firebase config
let config = {
    apiKey: "AIzaSyCgOPJ_ovnHss3uUDvITCM6OvylqWzXBNg",
    authDomain: "quotidie-7b0e6.firebaseapp.com",
    databaseURL: "https://quotidie-7b0e6.firebaseio.com",
    projectId: "quotidie-7b0e6",
    storageBucket: "",
    messagingSenderId: "630900411241",
    appId: "1:630900411241:web:b0b6961a0396176d20cbf8",
};
firebase.initializeApp(config);

// For the get_saint API
const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];

// send notifs to user stored in firebase
function send_notifs(req, resp) {
    let error = "no error";
    let notif_data = "Lisons l'évangile !";
    let url = "https://rss.aelf.org/evangile";
    parser
        .parseURL(url)
        .then((feed) => {
            notif_data = feed.items[0].title.substring(11) + ".";
        })
        .catch((err) => {
            console.log(err);
            error = err;
            resp.json(error);
        });
    firebase
        .database()
        .ref("PWA_users")
        .once("value")
        .then(function (data) {
            if (data.val() == null) {
                console.log("no data");
            } else {
                console.log("Got data");
                data = data.val();
                let notifs = Object.values(data);
                webpush.setVapidDetails(
                    "mailto:example@yourdomain.org",
                    "BNgw-Zyf0z8cX2-b45_L60or_52GbSy02Nw4bp_SAJt_M6e0Y_6W4E8u7XzDCcmkGRmkjDRL53acllyHqS7B0fs",
                    "uTXl_C56pDr7cDWIcorCRMsX6BUYuKS7HrO1aqfRuzQ"
                );
                notifs.forEach((notif, i) => {
                    webpush.sendNotification(JSON.parse(notif), notif_data);
                });
            }
        })
        .catch((err) => console.error(err));
    return resp.json("Hello notifications!");
}

function return_evangile_API(req, resp) {
    // Allow CORS stuff
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    (async () => {
        let evangile = await get_evangile_promise();
        resp.json(evangile);
    })().catch((err) => resp.json(null));
}

function get_evangile_promise() {
    return new Promise(function (resolve, reject) {
        (async () => {
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
            resolve(evangile);
        })().catch((err) => {
            console.error(err);
            reject();
        });
    });
}

function return_saint_API(req, resp) {
    // Allow CORS stuff
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    (async () => {
        let evangile = await get_saint_promise();
        resp.json(evangile);
    })().catch((err) => resp.json(null));
}

function get_saint_promise() {
    var d = new Date();
    var day_m = d.getDate();
    var day = d.getDay();
    var month = d.getMonth();
    let url2 = days[day] + "-" + day_m + "-" + months[month];
    let url = "https://fr.aleteia.org/daily-prayer/" + url2 + "/";

    return new Promise(function (resolve, reject) {
        rp(url)
            .then(function (body) {
                const $ = cheerio.load(body);
                let saint = {};
                saint.title = $(".css-1tmjk0q")["0"].children[0].data;
                saint.subtitle = $(".css-al50z9")["0"].children[0].data;
                saint.image_url = $(".css-tefugr")["0"].attribs.src;
                resolve(saint);
            })
            .catch(function (err) {
                console.log(err);
                reject();
            });
    });
}

module.exports = router;
