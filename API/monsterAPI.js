var express = require("express");
var router = express.Router();

var data = require("../Data/monstersData.js");

let monsters = data.monsters;

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app"];

// Endpoints
router.route("/get_rencontre").get(get_rencontre);

// Get playlist object from playlist url
async function get_rencontre(req, resp) {
    // CORS STUFF
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    let FPmin = Number(req.query.FPmin == undefined ? 0 : req.query.FPmin);
    let FPmax = Number(req.query.FPmax == undefined ? 30 : req.query.FPmax);
    let number = Number(req.query.number == undefined ? 3 : req.query.number);
    let alignement = req.query.alignement == undefined ? "NN" : req.query.alignement;
    let ident = req.query.ident == undefined ? "true" : req.query.ident;

    let candidates = [];

    console.log(FPmin, FPmax, number, alignement, ident);
    console.log(ident);

    for (const monster of monsters) {
        if (monster.FP < FPmax) {
            if (Number(monster.FP) > Number(FPmin)) {
                if (alignement[0] == monster.alignement[0] || alignement[0] == "A") {
                    if (alignement[1] == monster.alignement[1] || alignement[1] == "A") {
                        candidates.push(monster);
                    }
                }
            }
        }
    }

    let selected = [];

    if (ident == "true") {
        var monster = candidates[Math.floor(Math.random() * candidates.length)];
        for (let i = 0; i < number; i++) {
            selected.push(monster);
        }
    } else {
        for (let i = 0; i < number; i++) {
            let n = Math.floor(Math.random() * candidates.length);

            var monster = candidates[n];
            selected.push(monster);
        }
    }
    resp.json(selected);
}

module.exports = router;
