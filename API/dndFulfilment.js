var express = require("express");
var router = express.Router();
var rp = require("request-promise");
var rqst = require("request");

const data = require("../Data/spellsData");
let spells = data.spells;

const action = require("actions-on-google");
const { WebhookClient } = require("dialogflow-fulfillment");

// Endpoints
router.post("/fulfillment", express.json(), fulfillment);

function fulfillment(req, resp) {
    const agent = new WebhookClient({ request: req, response: resp });

    function welcome(agent) {
        agent.add("Bienvenue sur DnD !");
    }

    function defaultFallback(agent) {
        agent.add("Désolé, je n'ai pas compris...");
    }

    function getRange(agent) {
        let spell_name = agent.parameters.spell_name1;
        let spell_found = false;
        for (const spell of spells) {
            if (spell_name.toLowerCase() == spell.name.toLowerCase()) {
                spell_found = true;
                agent.add(capitalize(spell_name) + " a une portée de " + spell.range.substring(9) + ".");
            }
        }
        if (!spell_found) {
            agent.add("Je n'ai pas trouvé ce sort dans mon grimoire, pouvez-vous recommencer ?");
        }
    }

    function getDuration(agent) {
        let spell_name = agent.parameters.spell_name;
        let spell_found = false;
        for (const spell of spells) {
            if (spell_name.toLowerCase() == spell.name.toLowerCase()) {
                spell_found = true;
                if (spell.duration == "Durée : instantanée") {
                    agent.add("Le sort " + spell_name.toLowerCase() + " est instané.");
                } else {
                    agent.add(capitalize(spell_name) + " a une durée de " + spell.duration.substring(8) + ".");
                }
            }
        }
        if (!spell_found) {
            agent.add("Je n'ai pas trouvé ce sort dans mon grimoire, pouvez-vous recommencer ?");
        }
    }

    function getEffect(agent) {
        let spell_name = agent.parameters.spell_name;
        let spell_found = false;
        for (const spell of spells) {
            if (spell_name.toLowerCase() == spell.name.toLowerCase()) {
                spell_found = true;
                agent.add(spell.effect);
            }
        }
        if (!spell_found) {
            agent.add("Je n'ai pas trouvé ce sort dans mon grimoire, pouvez-vous recommencer ?");
        }
    }

    function getCard(agent) {
        let spell_name = agent.parameters.spell_name;
        let spell_found = false;
        for (const spell of spells) {
            if (spell_name.toLowerCase() == spell.name.toLowerCase()) {
                agent.add(spell.effect);
                spell_found = true;
                let str = "🎯 **Portée** : " + spell.range.substring(9) + ".  \n";
                str = str + "⌛ **Durée** : " + spell.duration.substring(8) + ".  \n";
                str = str + "⚡ **Niveau** : " + spell.level + ".  \n";
                str = str + "🧙 **École** : " + spell.school + ".  \n";
                str = str + "  \n" + spell.effect;
                agent.add(
                    new Card({
                        title: spell.name,
                        text: str,
                        buttonText: "Lien vers AideDD",
                        buttonUrl: spell.url,
                    })
                );
            }
        }
        if (!spell_found) {
            agent.add("Je n'ai pas trouvé ce sort dans mon grimoire, pouvez-vous recommencer ?");
        }
    }

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", defaultFallback);
    intentMap.set("get range", getRange);
    intentMap.set("get duration", getDuration);
    intentMap.set("get effect", getEffect);
    intentMap.set("get card", getCard);

    agent.handleRequest(intentMap);

    function capitalize(s) {
        if (typeof s !== "string") return "";
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}

module.exports = router;
