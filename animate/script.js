const canvas = document.getElementById('GameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

let gamespeed = 1;

console.log("HI");

const background = new Image();
background.src = 'assets/map.png';

let x = 0;
let x2 = 2000;


function backgroundanimation(){
    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(background, x, 0, 2000, height); 
    ctx.drawImage(background, x2, 0, 2000, height);

    if(x <= -2000) {
        x = 2000 - gamespeed;
    }
    else {
        x -= gamespeed;
    }
    if(x2 <= -2000) {
        x2 = 2000 - gamespeed;
    }
    else {
        x2 -= gamespeed;
    }
    requestAnimationFrame(backgroundanimation);
}

backgroundanimation();