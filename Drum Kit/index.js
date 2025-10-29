var buttonCount = document.querySelectorAll(".drum").length;

for (var i = 0; i < buttonCount; i++) {
    document.querySelectorAll(".drum")[i].addEventListener("click", function () {
        alert("You clicked me!");
    });
}
