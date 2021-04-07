var express = require("express");
var router = express.Router();

var data = require("../Data/monstersData.js");

let monsters = data.monsters;

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app", "https://dnd-app.netlify.app"];

// Endpoints
router.route("/get_rencontre").get(get_rencontre);

// Get playlist object from playlist url
async function get_rencontre(req, resp) {
    // http://192.168.1.18:8000/monsterAPI/get_rencontre?FPmin=0&FPmax=30&alignement=AA&number=5&types=Aberration,Aberration%20(m%C3%A9tamorphe),B%C3%AAte

    // CORS STUFF
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    console.log("--------------------------");
    console.log("--------------------------");
    console.log("--------------------------");

    let FPmin = eval(decodeURI(req.query.FPmin) == "undefined" ? 0 : decodeURI(req.query.FPmin));
    let FPmax = eval(req.query.FPmax == "undefined" ? 30 : decodeURI(req.query.FPmax));
    let number = parseInt(req.query.number == "undefined" ? 3 : decodeURI(req.query.number));
    let alignement = decodeURI(req.query.alignement) == "undefined" ? "NN" : decodeURI(req.query.alignement);
    let ident = decodeURI(req.query.ident) == "undefined" ? "false" : decodeURI(req.query.ident);
    let types = decodeURI(req.query.types) == "undefined" ? [] : decodeURI(req.query.types);
    types = types.split(",");
    if(types[0] === ''){
        types = [];
    }

    let candidates = [];

    console.log(FPmin, FPmax, number, alignement, ident, types);

    for (const monster of monsters) {
        if (eval(monster.FP) <= FPmax) {
            if (eval(monster.FP) >= FPmin) {
                if (alignement[0] == monster.alignement[0] || alignement[0] == "A") {
                    if (alignement[1] == monster.alignement[1] || alignement[1] == "A") {
                        if (types.length > 0) {
                            if (types.includes(monster.type)) {
                                candidates.push(monster);
                            }
                        } else {
                            candidates.push(monster);
                        }
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
