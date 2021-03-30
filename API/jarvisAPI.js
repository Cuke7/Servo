var express = require("express");
var router = express.Router();
const { NlpManager, ConversationContext } = require("node-nlp");
const context = new ConversationContext();

const allowedOrigins = ["http://127.0.0.1:8000", "http://127.0.0.1:8080", "https://quotidie.netlify.app"];

// Endpoints
router.route("/train").get(train);
router.route("/get").get(get);

// send notifs to user stored in firebase
function train(req, resp) {
    const manager = new NlpManager({ languages: ["fr"], autoSave: false });

    // Adds the utterances and intents for the NLP
    manager.addDocument("fr", "Quand arrive le tram à %tram_station%?", "tram.get_station");
    manager.addDocument("fr", "Donne moi les horaires du tram à %tram_station%?", "tram.get_station");
    manager.addDocument("fr", "Donne moi les horaires du tram pour %tram_station%?", "tram.get_station");

    manager.addDocument("fr", "Quand arrive le tram à %tram_station% direction %direction% ?", "tram.get_station");
    manager.addDocument("fr", "Quand arrive le tram à %tram_station% pour %direction% ?", "tram.get_station");
    manager.addDocument("fr", "Donne moi les horaires du tram à %tram_station% direction %direction% ?", "tram.get_station");
    manager.addDocument("fr", "Donne moi les horaires du tram à %tram_station% pour %direction% ?", "tram.get_station");

    // Train also the NLG
    manager.addAnswer("fr", "tram.get_station", "OK, voici les horaires du tram à {{tram_station}}, direction {{direction}}");

    // Add entities
    manager.addNamedEntityText("tram_station", "Roustaing", ["fr"], ["Roustaing"]);
    manager.addNamedEntityText("direction", "Bordeaux", ["fr"], ["Bordeaux", "Bordeaux centre"]);

    manager.slotManager.addSlot("tram.get_station", "tram_station", true, { fr: "Pour quelle station ?" });
    manager.slotManager.addSlot("tram.get_station", "direction", true, { fr: "Pour quelle direction ?" });

    // Train and save the model.
    (async () => {
        await manager.train();
        manager.save("./Data/module.nlp");
        resp.send("Model trained.");
        const response = await manager.process("fr", "Quand arrive le tram à roustaing ?");
        console.log(response);
    })();
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

    let input = req.query.input;

    manager.addDocument("fr", "Donne moi les horaires du tram à  %tram_station%", "get_tram");
    manager.addDocument("fr", "Quand arrive le tram à %tram_station%", "get_tram");

    manager.addNamedEntityText("tram_station", "Roustaing", ["fr"], ["Roustaing"]);
    manager.addNamedEntityText("tram_station", "Forum", ["fr"], ["Forum"]);
    manager.addNamedEntityText("tram_station", "Saint Genès", ["fr"], ["Saint Genes", "Saint-Genes"]);

    //manager.addNamedEntityText("direction", "Bordeaux", ["fr"], ["Bordeaux", "Bordeaux centre"]);
    //manager.addNamedEntityText("direction", "Pessac", ["fr"], ["Pessac", "Pessac centre"]);

    manager.slotManager.addSlot("get_tram", "tram_station", true, { fr: "Pour quelle station ?" });
    //manager.slotManager.addSlot("get_tram", "direction", true, { fr: "Quelle direction ?" });

    manager.addAnswer("fr", "get_tram", "Entendu, laissez moi chercher ça");

    await manager.train();

    const result1 = await manager.process("fr", input, context);

    resp.json({ text: result1.answer, result: result1, context: context });
}

module.exports = router;
