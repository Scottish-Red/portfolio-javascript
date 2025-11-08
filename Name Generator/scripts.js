// ===== DRESDEN FILES NAME GENERATOR =====
// Generates random character names inspired by the Dresden Files book series

// ===== NAME DATA ARRAYS =====
// Collections of first and last names themed for the Dresden Files universe

const firstNames = [
  "Elias","Miriam","Tobias","Cassandra","Gideon","Helena","Malcolm","Seraphina","Victor","Isolde",
  "Jack","Dana","Marcus","Lila","Frank","Nora","Samuel","Claire","Vincent","Irene",
  "Sylas","Elara","Kaelen","Vivienne","Oberon","Selene","Lucien","Thalia","Corvin","Iskra",
  "Rafe","Brynn","Connor","Maeve","Declan","Tessa","Rowan","Jax","Calla","Damon",
  "Horace","Lydia","Edmund","Octavia","Percival","Beatrice","Reginald","Minerva","Cedric","Dorothea",
  "Malachai","Selwyn","Vespera","Dorian","Calista","Ignatius","Serilda","Kael","Morwenna","Thorne",
  "Joey","Rita","Tommy","Frankie","Carla","Eddie","Benny","Marla","Tony","Sheila",
  "Zephyr","Nyx","Seraphiel","Orin","Lyra","Thalos","Elowen","Corvus","Sylvara","Harold",
  "Veronica","Damian","Eleanor","Charles","Miranda","Julian","Patricia","Nathaniel","Evelyn","Axel",
  "Cassia","Roderick","Garrick","Nyssa","Bram","Mirella","Jareth","Alaric","Fiona","Magnus"
];

const lastNames = [
  "Crowther","Blackthorn","Greaves","Vale","Ashcroft","Duskwood","Fenwick","Locke","Halloway","Ravenscar",
  "Rourke","Callahan","Kincaid","Donnelly","Mallory","Keegan","Drayton","O'Rourke","Calder","Maddox",
  "Thornveil","Mooncrest","Duskbane","Frostmark","Veyrault","Draemir","Blackvale","Wintermere","Nightrose","Veyline",
  "Hollowbrook","Ashpaw","Redfang","Ironhide","Stormclaw","Wildhart","Greyclaw","Fenrirson","Thornhide","Wolfsbane",
  "Whitcombe","Penhaligon","Blackwell","Greymantle","Dorrance","Holloway","Ashbourne","Quillan","Ravensworth","Vexley",
  "Draven","Korrick","Nocturne","Gravesend","Morvain","Crowe","Veyth","Dreadmoor","Skarde","Blackspire",
  "Marconi","Delgado","Greco","Russo","Mendoza","Novak","Caruso","Vescio","DeLuca","Kowalski",
  "Aurelian","Obsidian","Starborn","Shadowmere","Ebonveil","Veyndar","Frostveil","Moonveil","Kingsley","Ashford",
  "Whitlock","Prescott","Wentworth","Haversham","Blackthorne","Ketteridge","Crowhurst","Danforth","Veynar","Thornblade",
  "Flint","Crosswell","Hollowpoint","Darkwater","Ironvale","Frostfang","Duskthorn","Blackmoor","Stormrider","Grimshaw"
];

// ===== NAME GENERATION FUNCTION =====
// Randomly selects a first and last name, then displays it with a typewriter effect

function getName() {
    // Select random first and last names from arrays
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];

    // Combine into full name
    var name = first + " " + last;
    
    // Get the output element and clear any previous name
    var output = document.getElementById("output");
    output.textContent = "";
    
    // Typewriter effect: display one character at a time
    let i = 0;
    let interval = setInterval(() => {
        output.textContent += name[i];
        i++;
        // Stop the interval when all characters are displayed
        if (i === name.length) clearInterval(interval);
    }, 100); // 100ms delay between each character
}
