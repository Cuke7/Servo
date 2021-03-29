var express = require("express");
var router = express.Router();

var data = require("../Data/monstersData.js");

let monsters = data.monsters;

// Endpoints
router.route("/get_rencontre").get(get_rencontre);

let demo = "http://192.168.1.18:8000/monsterAPI/get_rencontre?FP=12";

// Get playlist object from playlist url
async function get_rencontre(req, resp) {
    let FPmin = Number(req.query.FPmin == undefined ? 0 : req.query.FPmin);
    let FPmax = Number(req.query.FPmax == undefined ? 30 : req.query.FPmax);
    let number = Number(req.query.number == undefined ? 3 : req.query.number);
    let alignement = req.query.alignement == undefined ? "NN" : req.query.alignement;

    let candidates = [];

    console.log(FPmin, FPmax, number, alignement);

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

    var monster = candidates[Math.floor(Math.random() * candidates.length)];
    for (let i = 0; i < number; i++) {
        selected.push(monster);
    }

    resp.json(selected);
}

module.exports = router;
