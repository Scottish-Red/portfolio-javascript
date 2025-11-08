// ===== PAIR-O-DICE GAME =====
// A simple dice rolling game for two players

// ===== DICE ROLL FUNCTION =====
// Generates random dice images for both players and determines the winner

function btnRoll() {
    // Generate random dice (1-6) for Player 1
    var outputOne = "../Assets/images/dice" + [Math.floor(Math.random() * 6) + 1] + ".png";
    document.querySelector(".img1").setAttribute("src", outputOne);

    // Generate random dice (1-6) for Player 2
    var outputTwo = "../Assets/images/dice" + [Math.floor(Math.random() * 6) + 1] + ".png";
    document.querySelector(".img2").setAttribute("src", outputTwo);

    // Determine winner by comparing dice image paths (higher number wins)
    if (outputOne > outputTwo) {
        document.querySelector("h1").innerHTML = "Player 1 Wins!";
    } else if (outputTwo > outputOne) {
        document.querySelector("h1").innerHTML = "Player 2 Wins!";
    } else if (outputOne === outputTwo) {
        document.querySelector("h1").innerHTML = "It's a Draw!";
    }
}
