// ===== DRUM KIT SOUND PLAYER =====
// This app allows users to play drum sounds by clicking buttons or pressing keyboard keys

// ===== SOUND PLAYBACK FUNCTION =====
// Maps each key to its corresponding drum sound file

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
            // No sound for unrecognized keys
            break;
    }
}

// ===== EVENT LISTENERS =====
// Set up both mouse click and keyboard press handlers

// Get the count of drum buttons for iteration
var buttonCount = document.querySelectorAll(".drum").length;

// Mouse click event - play sound when button is clicked
for (var i = 0; i < buttonCount; i++) {
    document.querySelectorAll(".drum")[i].addEventListener("click", function () {
        // Get the button's text content (W, A, S, D, J, K, or L) and convert to lowercase
        playSound(this.innerHTML.toLowerCase());
    });
}

// Keyboard press event - play sound when corresponding key is pressed
document.addEventListener("keydown", function (event) {
    playSound(event.key.toLowerCase());
});
