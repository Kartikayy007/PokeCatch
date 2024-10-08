window.addEventListener('load', function() {
    const canvas = document.getElementById('GameCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    class Input {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', (e) => {
                if ((e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') 
                    && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', (e) => {
                if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(Gamewidth, Gameheight) {
            this.Gamewidth = Gamewidth;
            this.Gameheight = Gameheight;
            this.width = 210;
            this.height = 200;
            this.x = 100;
            this.y = this.Gameheight - this.height - 110;
            this.player = document.getElementById('ash');
            
            this.frames = [0, 1.2, 2.6, 3.6, 4.6, 5.8, 7.1, 8.1];
            this.index = 0;
            this.frameY = 0;
            this.timer = 0;
            this.interval = 1000/15; 
            
            this.vy = 0;
            this.gravity = 1;
            this.speed = 0;
        }

        draw(context) {
            const frameX = Math.floor(this.frames[this.index] * this.width);
            context.drawImage(
                this.player, 
                frameX, 
                this.frameY * this.height, 
                this.width, 
                this.height, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        }

        update(input, deltaTime) {
            if (input.keys.indexOf('d') > -1) {
                this.speed = 10;
                this.frameY = 0; 
            } else if (input.keys.indexOf('a') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('w') > -1 && this.onGround()) {
                this.vy -= 20;
            } else {
                this.speed = 0;
            }

            this.x += this.speed;
            this.y += this.vy;

            if (this.x < 0) this.x = 0;
            else if (this.x > this.Gamewidth - this.width) {
                this.x = this.Gamewidth - this.width;
            }

            if (!this.onGround()) {
                this.vy += this.gravity;
            } else {
                this.vy = 0;
            }
            if (this.y > this.Gameheight - this.height) {
                this.y = this.Gameheight - this.height;
            }

            if (this.timer > this.interval) {
                this.timer = 0;
                if (this.speed !== 0) {
                    this.index = (this.index + 1) % this.frames.length;
                } else {
                    this.index = 0; 
                }
            } else {
                this.timer += deltaTime;
            }
        }

        onGround() {
            return this.y >= this.Gameheight - this.height - 110;
        }
    }

    class PokeBall {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 20;
            this.speed = 10;
            this.ballImage = document.getElementById('pokeball'); 
        }

        draw(context) {
            context.drawImage(this.ballImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }

        update() {
            this.x += this.speed;
        }
    }

    class Background {
        constructor(Gamewidth, Gameheight) {
            this.Gamewidth = Gamewidth;
            this.Gameheight = Gameheight;
            this.width = 1700;
            this.height = 990;
            this.x = 0;
            this.y = 0;
            this.image = document.getElementById('map');
            this.speed = 1;
        }
        draw(context) {
            context.drawImage(
                this.image, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        }
        update() {
            this.x -= this.speed;
        }
    }

    const input = new Input();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const pokeBalls = [];

    window.addEventListener('click', (e) => {
        const pokeBall = new PokeBall(player.x + player.width, player.y + player.height / 2);
        pokeBalls.push(pokeBall);
    });

    let lastime = 0;

    function animation(timeStamp) {
        const deltaTime = timeStamp - lastime;
        lastime = timeStamp;
        
        ctx.clearRect(0, 0, width, height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime);

        pokeBalls.forEach((pokeBall, index) => {
            pokeBall.update();
            pokeBall.draw(ctx);
            if (pokeBall.x > canvas.width) {
                pokeBalls.splice(index, 1);
            }
        });

        requestAnimationFrame(animation);
    }
    animation(0);
});