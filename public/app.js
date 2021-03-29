// Init vue (to acess data : vue.drawer = true)
let vue = new Vue({
    el: "#app",
    vuetify: new Vuetify({
        theme: {
            themes: {
                light: {
                    primary: "#000080",
                    secondary: "#d1b83d",
                    tertiary: "#c9720e",
                    grey: "#faf7f7",
                    accent: "#3557bd",
                },
                dark: {
                    primary: "#000080",
                    grey: "#292828",
                },
            },
        },
    }),
    data: () => ({
        monsters: [],
        nothing: false,
        show: false,
        FP_range: [3, 11],
        al1: "Neutre",
        al2: "Neutre",
        align2: ["Bon", "Neutre", "Mauvais", "Tout"],
        align1: ["Loyal", "Neutre", "Chaotique", "Tout"],
        number: "3",
        values: ["0", "1/8", "1/4", "1/2", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        values2: [0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    }),
    methods: {
        generate_rencontre: function () {
            let key = 0;
            get_data_from_server().then((data) => {
                if (data[0] == null) {
                    this.monsters = [];
                    this.nothing = true;
                    console.log("Nothing found");
                } else {
                    for (const monster of data) {
                        monster.show = false;
                        monster.key = key;
                        key++;
                        this.nothing = false;
                    }
                    this.monsters = data;
                }
            });
        },
    },
    computed: {
        url: function () {
            let FPmin = this.values2[this.FP_range[0]];
            let FPmax = this.values2[this.FP_range[1]];
            let number = this.number;

            let align = "";

            switch (this.al1) {
                case "Loyal":
                    align = "L";
                    break;
                case "Neutre":
                    align = "N";
                    break;
                case "Chaotique":
                    align = "C";
                case "Tout":
                    align = "A";
                    break;
            }

            switch (this.al2) {
                case "Bon":
                    align = align + "B";
                    break;
                case "Neutre":
                    align = align + "N";
                    break;
                case "Mauvais":
                    align = align + "M";
                case "Tout":
                    align = align + "A";
                    break;
            }

            return "/monsterAPI/get_rencontre?FPmin=" + FPmin + "&FPmax=" + FPmax + "&alignement=" + align + "&number=" + number;
        },
    },
    watch: {
        url: function (val) {
            this.generate_rencontre();
        },
    },
});

//vue.generate_rencontre();

// Get data

// Get data from the server
function get_data_from_server() {
    //console.log(vue.url);
    return fetch(vue.url)
        .then((response) => {
            return response.json();
        })
        .catch(() => {
            return null;
        });
}
