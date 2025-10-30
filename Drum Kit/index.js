// Function to play sound based on key
function playSound(key) {
    switch (key) {
        case "w":
            new Audio("sounds/tom-1.mp3").play();
            break;
        case "a":
            new Audio("sounds/tom-2.mp3").play();
            break;
        case "s":
            new Audio("sounds/tom-3.mp3").play();
            break;
        case "d":
            new Audio("sounds/tom-4.mp3").play();
            break;
        case "j":
            new Audio("sounds/snare.mp3").play();
            break;
        case "k":
            new Audio("sounds/crash.mp3").play();
            break;
        case "l":
            new Audio("sounds/kick-bass.mp3").play();
            break;
        default:
            // Optional: handle other keys
            break;
    }
}

// Mouse click event
for (var i = 0; i < buttonCount; i++) {
    document.querySelectorAll(".drum")[i].addEventListener("click", function () {
        playSound(this.innerHTML);
    });
}

// Keyboard press event
document.addEventListener("keydown", function (event) {
    playSound(event.key);
});

var buttonCount = document.querySelectorAll(".drum").length;

for (var i = 0; i < buttonCount; i++) {
    document.querySelectorAll(".drum")[i].addEventListener("click", function() {
        if (this.innerHTML === "w") {
            new Audio("sounds/tom-1.mp3").play(); // Creates a new audio object & plays the sound on click
        } else if (this.innerHTML === "a") {
            new Audio("sounds/tom-2.mp3").play();
        } else if (this.innerHTML === "s") {
            new Audio("sounds/tom-3.mp3").play();
        } else if (this.innerHTML === "d") {
            new Audio("sounds/tom-4.mp3").play();
        } else if (this.innerHTML === "j") {
            new Audio("sounds/snare.mp3").play();
        } else if (this.innerHTML === "k") {
            new Audio("sounds/crash.mp3").play();
        } else if (this.innerHTML === "l") {
            new Audio("sounds/kick-bass.mp3").play();
        }
    });
}
