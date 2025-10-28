var names = [
    "Elias Crowther",
    "Maren Blackthorn",
    "Tobias Greaves",
    "Selene Veyra",
    "Conrad Hallowell",
    "Isolde Fenwick",
    "Damian Rourke",
    "Thalia Morrigan",
    "Victor Draemont",
    "Cassandra Vale",
    "Gideon Ashcroft",
    "Liora Kestrel",
    "Malcolm Dredge",
    "Seraphine Locke",
    "Nathaniel cross",
    "Ophelia Stroud",
    "Julian Veylor",
    "Mireille Duskbane",
    "Rowan Calder",
    "Sylas Thornfield"
]

function getName() {
    var n = Math.floor(Math.random() * names.length);
    var name = names[n];
    var output = document.getElementById("output");
    output.textContent = "";
    
    let i=0;
    let interval = setInterval(() => {
        output.textContent += name[i];
        i++;
        if (i === name.length) clearInterval(interval);
    }, 100);
}
