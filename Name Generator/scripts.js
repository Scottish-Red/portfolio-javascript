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
  "Rourke","Callahan","Kincaid","Donnelly","Mallory","Keegan","Drayton","O’Rourke","Calder","Maddox",
  "Thornveil","Mooncrest","Duskbane","Frostmark","Veyrault","Draemir","Blackvale","Wintermere","Nightrose","Veyline",
  "Hollowbrook","Ashpaw","Redfang","Ironhide","Stormclaw","Wildhart","Greyclaw","Fenrirson","Thornhide","Wolfsbane",
  "Whitcombe","Penhaligon","Blackwell","Greymantle","Dorrance","Holloway","Ashbourne","Quillan","Ravensworth","Vexley",
  "Draven","Korrick","Nocturne","Gravesend","Morvain","Crowe","Veyth","Dreadmoor","Skarde","Blackspire",
  "Marconi","Delgado","Greco","Russo","Mendoza","Novak","Caruso","Vescio","DeLuca","Kowalski",
  "Aurelian","Obsidian","Starborn","Shadowmere","Ebonveil","Veyndar","Frostveil","Moonveil","Kingsley","Ashford",
  "Whitlock","Prescott","Wentworth","Haversham","Blackthorne","Ketteridge","Crowhurst","Danforth","Veynar","Thornblade",
  "Flint","Crosswell","Hollowpoint","Darkwater","Ironvale","Frostfang","Duskthorn","Blackmoor","Stormrider","Grimshaw"
];

function getName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];

    var name = first + " " + last;
    var output = document.getElementById("output");
    output.textContent = "";
    
    let i=0;
    let interval = setInterval(() => {
        output.textContent += name[i];
        i++;
        if (i === name.length) clearInterval(interval);
    }, 100);
}
