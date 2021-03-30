var express = require("express");
var router = express.Router();

const puppeteer = require("puppeteer");
var tram_data = require("../Data/tramData.js");
const autocorrect = require("autocorrect")({
    words: tram_data.dictionary,
});

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app"];

// Endpoints
router.route("/get_station_times").get(get_station_times);

// Get playlist object from playlist url
async function get_station_times(req, res) {
    // Allow CORS stuff
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials", true);

    var station = req.query.station;

    let info = get_url(station);

    let url = info[1];

    function get_url(input) {
        let station = autocorrect(input);

        let rep = [];
        for (let i = 0; i < tram_data.bordeaux.length; i++) {
            if (tram_data.bordeaux[i][0] == station) {
                rep = [station, [tram_data.bordeaux[i][1]]];
            }
        }
        for (let i = 0; i < tram_data.pessac.length; i++) {
            if (tram_data.pessac[i][0] == station) {
                rep[1].push(tram_data.pessac[i][1]);
            }
        }
        return rep;
    }

    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    let response_all = [];

    for (let dir = 0; dir < 2; dir++) {
        const page = await browser.newPage();
        await page.goto(url[dir]);

        await page.waitForSelector(".waittime");

        let times_temp = await page.evaluate(() => {
            let times = [];
            let trams = document.getElementsByClassName("display-flex justify-space-between align-content-stretch align-items-end");
            for (const tram of trams) {
                let temp = tram.innerText.replaceAll("\n", " ");
                //temp = temp.substring(0, temp.length - 1);
                times.push(temp);
            }
            return times;
        });

        let direction_name;

        if (dir == 0) direction_name = "Bordeaux";
        if (dir == 1) direction_name = "Pessac";

        let response_temp = {
            station: info[0],
            direction: direction_name,
            url: url[dir],
            data: times_temp,
        };

        response_all.push(response_temp);
    }

    let response = response_all;

    res.json(response);

    await browser.close();
}

module.exports = router;
