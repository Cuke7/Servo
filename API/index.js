var express = require("express");
var router = express.Router();

router.use("/musicAPI", require("./musicAPI.js"));
router.use("/tramAPI", require("./tramAPI.js"));
router.use("/dndFulfilment", require("./dndFulfilment.js"));
router.use("/monsterAPI", require("./monsterAPI.js"));

module.exports = router;
