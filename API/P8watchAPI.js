var express = require("express");
var router = express.Router();

// Endpoints
router.route("/weather").get(return_weather);

const request = require("request");

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app"];

let url = "https://api.openweathermap.org/data/2.5/onecall?lat=44.493179&lon=-0.63952&exclude=current,minutely,daily,alerts&appid=5079817a0f73cd7ba5f93db4dab118c9&units=metric";

function return_weather(req, resp) {
    // Allow CORS stuff
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    request(url, function (error, response, body) {
        //console.error("error:", error); // Print the error if one occurred
        //console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        //console.log("body:", body); // Print the HTML for the Google homepage.

        let data = JSON.parse(body);
        console.log(data.hourly[2].temp);
        let weather = data.hourly[2].weather;
        console.log(weather);
        resp.send(Math.round(data.hourly[2].temp) + "° " + weather[0].description + ";" + weather[0].icon);
    });
}
module.exports = router;
