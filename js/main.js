//Configuration parameters for Phaser.
var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 300 }
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
		render: render
	},
	audio: {
		noAudio: false
	}
};

var game = new Phaser.Game(config);

// Variables related to playerCharacter
var playerCharacter;
var playerCharacter2;
var walkSpeed = 150;
var playerJumpSound;
var playerBounceSound;
var playerHurt;

// Variables related to enemies
var enemies = [];

//Variables related to the world.
var platforms;
var layer2;
var backGroundMusic;
var muteButton;

//Variables related to the game.
var gameStarted = false;
var createFired = false;
var gameOverBool = false;

//Variables for Main Menu
var mainMenuBackground;
var mainMenuText = [
	'Welcome to Balloon Jumper!',
	'You play with 2 characters, you control these with the W, A, and D keys for Player 1',
	'Up, Left and Right keys for Player 2.',
	'',
	'Both the Players have their own key for Attack Mode, a key for being able to hit the enemy',
	'For Player 1 this is the S key, for Player 2 it is the Down key',
	'If the enemy hits you multiple times, the game ends. You can press R to restart the game.',
	'',
	'You have a total of 3 lives.',
	'',
	'To start playing, hit the Spacebar!'
];

//Preload statement for Phaser.
function preload() {

	//Spritesheet for dude / player.
	this.load.spritesheet(
		'dude',
		'./images/dude.png',
		{frameWidth: 32, frameHeight: 48}
	);

	this.load.spritesheet(
		'enemy',
		'./images/droid.png',
		{frameWidth: 32, frameHeight: 32}
	);

	//Loading a couple of images.
	this.load.image("backdrop", "./images/backdrop.png");
	this.load.image("ground", "./images/groundBars.png");
	this.load.image("balloon", "./images/balloon.png");
	this.load.image("black", "./images/black.png");
	this.load.image("muteBtn", "./images/muteBtn.png");

	// Loading a couple of Audio clips //
	this.load.audio("bg", "./audio/AnanasInteractive.wav");
	this.load.audio("playerJump", './audio/sfx_movement_jump4.wav'); //Player Jump

	this.load.audio("playerBounce", './audio/sfx_sounds_powerup8.wav');
	this.load.audio("playerHurt", './audio/hurt.wav');
}

function create() {
	//Background image.
	this.add.image(0, 0, 'backdrop').setOrigin(0, 0);

	//Creates animations for both Player 1 and 2.
	//Copied code from https://phaser.io/tutorials/making-your-first-phaser-3-game/part5
	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'turn',
		frames: [{ key: 'dude', frame: 4 }],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1
	});

	//Adding 2 players to the game.
	//move and jump keys, offset for label, xPos, yPos, name.
	playerCharacter = new Player(this,
		Phaser.Input.Keyboard.KeyCodes.W,
		Phaser.Input.Keyboard.KeyCodes.A,
		Phaser.Input.Keyboard.KeyCodes.D,
		Phaser.Input.Keyboard.KeyCodes.S,
		0,
		64,
		100,
		"Player 1");
	this.add.existing(playerCharacter); //Allowing Phaser to actually manipulate the character.

	playerCharacter2 = new Player(this,
		Phaser.Input.Keyboard.KeyCodes.UP,
		Phaser.Input.Keyboard.KeyCodes.LEFT,
		Phaser.Input.Keyboard.KeyCodes.RIGHT,
		Phaser.Input.Keyboard.KeyCodes.DOWN,
		0,
		600,
		100,
		"Player 2");
	this.add.existing(playerCharacter2);

	playerCharacter.anims.play('turn');
	playerCharacter2.anims.play('turn');

	//Terrain gen.
	platforms = this.physics.add.staticGroup();

	//Making a group, allows us to call platforms.create, a shorter way of writing "game.add.sprite(parameters);
	platforms.create(400, 568, 'ground').setScale(2).refreshBody();
	platforms.create(600, 400, 'ground');
	platforms.create(50, 250, 'ground');
	platforms.create(750, 220, 'ground');

	//Top and Bottom bars to stop player moving through the ceiling or ground.
	platforms.create(128, -16, 'ground');
	platforms.create(384, -16, 'ground');
	platforms.create(640, -16, 'ground');
	platforms.create(700, -16, 'ground');
	platforms.create(128, 615, 'ground');
	platforms.create(384, 615, 'ground');
	platforms.create(640, 615, 'ground');
	platforms.create(700, 615, 'ground');

	//To stop player moving through the platform.
	this.physics.add.collider([playerCharacter, playerCharacter2], platforms); 

	//Creates a new enemycharacter. In essence this could be used to make multiple enemies.
	//Game, xPos, yPos, Name, direction (left = true, randomInt is either 0 or 1, false or true.);
	enemyCharacter = new Enemy(this, 400, 400, 'enemy1', getRandomInt(2));

	this.add.existing(enemyCharacter);

	//Animation for the Enemies.
	this.anims.create({
		key: 'idle',
		frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
		frameRate: 10,
		repeat: -1
	});
	enemyCharacter.anims.play('idle');

	//Apparently game needs to be set for delayedCall's to work.
	game = this;

	//Fires off the create function on both players.
	//We have to call these functions, also for the update, because Phaser 3 does not do global update calls anymore.
	playerCharacter.create(this);
	playerCharacter2.create(this);

	//this.physics.add.collide(playerCharacter, enemyCharacter, function () { hitPlayer(playerCharacter); }, null, this);
	this.physics.add.overlap(playerCharacter, enemyCharacter, function () { hitPlayer(playerCharacter, enemyCharacter); }, null, this);
	this.physics.add.overlap(playerCharacter2, enemyCharacter, function () { hitPlayer(playerCharacter2, enemyCharacter); }, null, this);

	// AUDIO //
	backGroundMusic = this.sound.add("bg");
	backGroundMusic.play();

	playerJumpSound = this.sound.add("playerJump");
	playerJumpSound.volume = 0.1;
	playerBounceSound = this.sound.add("playerBounce");
	playerBounceSound.volume = 0.1;
	playerHurt = this.sound.add("playerHurt");
	playerHurt.volume = 0.1;

	//Allows the user to mute the music.
	muteButton = this.add.sprite(20, 20, 'muteBtn').setInteractive();
	muteButton.on('pointerdown', toggleMute, this);

	//Sets the volume to 0 so that no sounds will play before the sound starts.
	this.sound.volume = 0;

	//Main Menu
	mainMenuBackground = this.add.sprite(0, 0, 'black').setOrigin(0, 0);
	mainMenuText = this.add.text(80, 40, mainMenuText, { fontFamily: 'Calibri', color: '#eeeeee', align: 'center' });
}

//If player gets hit by the enemy, he will loose a balloon. If he looses all of his balloons, the game will end.
var stillNeedToHit = true;
function hitPlayer(playerHit, enemyHit) {
	var gameWon;

	//If playerHit was playerCharacter, stillNeedToHit cooldown is false, and if the player does not have Attackmode on.
	if (playerHit == playerCharacter && stillNeedToHit && !playerCharacter.hitEnemy) {
		if (playerCharacter.balloons.children.entries.length > 0) {
			playerCharacter.balloons.children.entries[playerCharacter.balloons.children.entries.length - 1].destroy();

		} else {
			gameOver(true, 2); //If it was because of Balloons, and which player won.
		}
	} else if (playerHit == playerCharacter2 && stillNeedToHit && !playerCharacter2.hitEnemy) {
		if (playerCharacter2.balloons.children.entries.length > 0) {
			playerCharacter2.balloons.children.entries[playerCharacter2.balloons.children.entries.length - 1].destroy();
		} else {
			gameOver(true, 1);
		}
	}

	//TODO look into simplyfying repetitive code.
	if (playerHit == playerCharacter && playerCharacter.hitEnemy) {
		enemyHit.destroy();
		enemyCharacter = null;
		gameOver(false, 1);
		
	} else if (playerHit == playerCharacter2 && playerCharacter2.hitEnemy) {
		enemyHit.destroy();
		enemyCharacter = null;
		gameOver(false, 2);
	}

	stillNeedToHit = false;

	//Lets phaser perform a call after a certain amount of time has passed.
	var timedEvent = game.time.delayedCall(3000, function () { stillNeedToHit = true; }, [], this); //copied from https://labs.phaser.io/edit.html?src=src\time\timer%20event.js
}

function update() {

	//To prevent the game from running, so that we can make a make-shift main menu.
	if (!gameStarted || gameOverBool) {
		if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown) {
			mainMenuBackground.destroy();
			mainMenuText.text = "";
			this.sound.volume = 1;
			gameStarted = true;
		}

		if (gameOverBool) {
			if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).isDown) {
				gameStarted = true;
				console.log("restarting");
				location.reload();
			}
		}
		return;
	}

	//Updates the playerCharacters.
	playerCharacter.update();
	playerCharacter2.update();

	//Wraps defined characters around the game screen.
	this.physics.world.wrap(playerCharacter, 12); 
	this.physics.world.wrap(playerCharacter2, 12); 
	
	//update enemies.
	if (enemyCharacter !== null) {
		enemyCharacter.update(this);
		this.physics.world.wrap(enemyCharacter, 12);
	}

	//Play a hurt sound if the player is hit, dont play when already playing.
	if (enemyCharacter !== null && this.physics.collide([playerCharacter, playerCharacter2], enemyCharacter)) {
		if (!playerHurt.isPlaying) {
			playerHurt.play();
		}
	}

}

//Used for debug purposes.
function render() {

}

//Mutes all the game sound.
function toggleMute() {
	if (!this.sound.mute) {
		this.sound.mute = true;
	} else {
		this.sound.mute = false;
	}
}

//Toggle the game-won texts.
function gameOver(balloons, player) {
	if (balloons) {
		gameWon = game.add.text(250, 300, "Out of Balloons! Player " + player + " won! Press R to restart!");
	} else {
		gameWon = game.add.text(250, 300, "Player " + player + " won! Press R to restart!");
	}
	gameWon.setFill('#333333');
	gameOverBool = true;
}

//To get a random integer between 0 and 2, copied from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}