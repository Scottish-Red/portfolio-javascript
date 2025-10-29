var outputOne = "./images/dice" + [Math.floor(Math.random() * 6) + 1] + ".png";
document.querySelector(".img1").setAttribute("src", outputOne);

var outputTwo = "./images/dice" + [Math.floor(Math.random() * 6) + 1] + ".png";
document.querySelector(".img2").setAttribute("src", outputTwo);

if (outputOne > outputTwo) {
    document.querySelector("h1").innerHTML = "Player 1 Wins!";
    } else if (outputTwo > outputOne) {
        document.querySelector("h1").innerHTML = "Player 2 Wins!";
    } else if (outputOne === outputTwo) {
        document.querySelector("h1").innerHTML = "It's a Draw!";
    };