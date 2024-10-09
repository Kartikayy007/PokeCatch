window.addEventListener('load', function() {
    const introscreen = document.getElementById('intro');
    const button = document.getElementById('play');
    const bgm = document.getElementById('bg');

    button.addEventListener('click', function() {
        bgm.play();
        startGame();
        introscreen.style.display = 'none';
    });

    function startGame() {
    const canvas = document.getElementById('GameCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    let gameover = false;
    let score = 0;
    let space = true;
    

    class Input {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', (e) => {
                if ((e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' || e.key === ' ') 
                    && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', (e) => {
                if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' || e.key === ' ') {
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
            this.onright = false;
        }

        draw(context) {
            const frameX = this.frames[this.index] * this.width;
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

        update(input, time, background) {
            this.onright = false;

            if (input.keys.indexOf('d') > -1) {
                this.onright = true;
                this.frameY = 0;
                
                
                if (this.x >= 100) {
                    background.speed = -12;
                    this.speed = 0;
                } 
                else {
                    background.speed = 0;
                    this.speed = 10;
                }
            } 
            else if (input.keys.indexOf('a') > -1) {
                this.speed = -5;
                background.speed = 0;
            } 
            else {
                this.speed = 0;
                background.speed = 0;
            }
            
            if (input.keys.indexOf('w') > -1 && this.onGround()) {
                this.vy -= 30;
            }
            
            this.x += this.speed;
            this.y += this.vy;

            if (this.x < 0) this.x = 0;

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
                if (this.onright || this.speed !== 0) {
                    this.index = (this.index + 1) % this.frames.length;
                }
                else {
                    this.index = 0;
                }
            } 
            else {
                this.timer += time;
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
            this.ball = document.getElementById('pokeball');
        }

        draw(context) {
            context.drawImage(this.ball, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }

        update(background) {
            this.x += this.speed - background.speed;
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
            this.speed = 0;
        }
        
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
        
        update() {
            this.x += this.speed;
            if (this.x <= -this.width) {
                this.x = 0;
            }
        }
    }

    class Pokemon {
        constructor(Gamewidth, Gameheight, Enemy = false) {
            this.Gamewidth = Gamewidth;
            this.Gameheight = Gameheight;
            this.width = 170;
            this.height = 150;
            this.x = this.Gamewidth + 100; 
            this.y = this.Gameheight - this.height - 132;
            this.image = document.getElementById(Enemy ? 'enemy-poke' : 'pika');
            this.Enemy = Enemy;
            this.remove = false;
        }
    
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    
        update(background) {
            this.x += background.speed;
            
            if (this.x < -this.width) {
                this.remove = true;
            }
        }
    }

    function Pcollision(player, pokemon) {
        return player.x < pokemon.x + pokemon.width &&
               player.x + player.width > pokemon.x &&
               player.y < pokemon.y + pokemon.height &&
               player.y + player.height > pokemon.y;
    }

    function BCollision(pokeBall, pokemon) {
        return pokeBall.x < pokemon.x + pokemon.width &&
               pokeBall.x + pokeBall.radius * 2 > pokemon.x &&
               pokeBall.y < pokemon.y + pokemon.height &&
               pokeBall.y + pokeBall.radius * 2 > pokemon.y;
    }

    const input = new Input();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    let pokemons = [];
    const pokeBalls = [];

    let lastTime = 0;
    let spawn = 0;
    let interval = 2000;

    function spawnpokemon() {
        let Enemy = Math.random() < 0.4;
        const pokemon = new Pokemon(canvas.width, canvas.height, Enemy);
        pokemons.push(pokemon);
    }
    

    function totalScore(context) {
        context.fillStyle = 'white';
        context.font = '27px poppins';
        context.fillText(`Pokémons caught: ${score}`, 10, 30);
    }

    function gameOver(context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '59px poppins';
        context.textAlign = 'center';
        context.fillText(`Game Over! Pokémons caught: ${score}`, canvas.width/2, canvas.height/2);
    }

    function animation(timestamp) {
        const time = timestamp - lastTime;
        lastTime = timestamp;
        
        ctx.clearRect(0, 0, width, height);
        
        background.draw(ctx);
        background.update();
        
        player.draw(ctx);
        player.update(input, time, background);

        if (input.keys.indexOf(' ') > -1 && space) {
            const pokeBall = new PokeBall(player.x + player.width, player.y + player.height / 2);
            pokeBalls.push(pokeBall);
            space = false;
            setTimeout(() => {
                space = true;
            }, 500);
        }

        spawn = spawn + time;
        if (spawn > interval) {
            spawnpokemon();
            spawn = 0;
            interval = Math.random() * (2000-1000) + 1000; 
        }

        pokemons.forEach((pokemon) => {
            pokemon.draw(ctx);
            pokemon.update(background);

            if (Pcollision(player, pokemon) && pokemon.Enemy) {
                gameover = true;
            }
        });

        pokeBalls.forEach((pokeBall) => {
            pokeBall.draw(ctx);
            pokeBall.update(background);

            pokemons.forEach((pokemon, indexpokemon) => {
                if (BCollision(pokeBall, pokemon)) {
                    if (pokemon.Enemy) {
                        gameover = true;
                    } else {
                        score++; 
                        pokemons.splice(indexpokemon, 1); 
                        pokeBalls.splice(indexpokemon, 1); 
                    }
                }
            });
        });

        if (gameover) {
            gameOver(ctx);
            bgm.pause();

        } else {
            totalScore(ctx);
            requestAnimationFrame(animation);
        }

        pokemons = pokemons.filter(pokemon => !pokemon.remove);
    }

    requestAnimationFrame(animation);
    }

});