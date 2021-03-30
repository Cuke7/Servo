var express = require("express");
var router = express.Router();
const { NlpManager, ConversationContext } = require("node-nlp");
const context = new ConversationContext();

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app"];

// Endpoints
router.route("/train").get(train);
router.route("/get").get(get);

// send notifs to user stored in firebase
async function train(req, resp) {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    const manager = new NlpManager({ languages: ["fr"], autoSave: false });

    // TRAM STUFF
    manager.addDocument("fr", "Donne moi les horaires du tram à  %tram_station%", "get_tram");
    manager.addDocument("fr", "Quand arrive le tram à %tram_station%", "get_tram");

    manager.addNamedEntityText("tram_station", "Roustaing", ["fr"], ["Roustaing"]);
    manager.addNamedEntityText("tram_station", "Forum", ["fr"], ["Forum"]);
    manager.addNamedEntityText("tram_station", "Saint Genès", ["fr"], ["Saint Genes", "Saint-Genes"]);

    manager.slotManager.addSlot("get_tram", "tram_station", true, { fr: "Pour quelle station ?" });

    manager.addAnswer("fr", "get_tram", "Entendu, laissez moi chercher ça.");

    // MUSIC STUFF
    manager.addDocument("fr", "Mets un peu de musique", "launch_music");
    manager.addDocument("fr", "Change la musique", "launch_music");

    manager.addDocument("fr", "Mets en pause", "pause_music");
    manager.addDocument("fr", "Pause", "pause_music");

    manager.addDocument("fr", "Lecture", "play_music");
    manager.addDocument("fr", "Remet la musique", "play_music");

    manager.addAnswer("fr", "pause_music", "Je met en pause.");
    manager.addAnswer("fr", "play_music", "Je remet la musique.");
    manager.addAnswer("fr", "launch_music", "C'est parti !");
    manager.addAnswer("fr", "launch_music", "Ça marche.");

    await manager.train();

    // Train and save the model.
    await manager.train();
    manager.save("./Data/module.nlp");
    resp.send("Model trained.");
}

async function get(req, resp) {
    // Allow CORS stuff
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        resp.setHeader("Access-Control-Allow-Origin", origin);
    }
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    resp.setHeader("Access-Control-Allow-Credentials", true);

    const manager = new NlpManager({ languages: ["fr"], forceNer: true });

    manager.load("./Data/module.nlp");

    let input = req.query.input;

    const result1 = await manager.process("fr", input, context);

    resp.json({ text: result1.answer, result: result1, context: context });
}

module.exports = router;
