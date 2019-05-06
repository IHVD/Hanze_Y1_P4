// Used Rando Wiltschek's (teacher)'s code to base this from.

var keyUP;
var keyLEFT;
var keyRIGHT;
var keyHIT;
var jumpPressed;

var balloons;

var labelName;
var labelAttack;
var playerName;

var hitTimer = 5;

var hitEnemy = false;

//Making a new class that extends the Phaser Sprite class. This allows us to easily make as many players as we want.
var Player = new Phaser.Class({
	Extends: Phaser.GameObjects.Sprite,

	initialize:
		function Player(game, keyUp, keyLeft, keyRight, keyHit, offsetX, xPos, yPos, name) {
			Phaser.GameObjects.Sprite.call(this, game, xPos, yPos, 'dude');

			//Adding input listeners, keys, to the player's variables.
			this.keyUP = game.input.keyboard.addKey(keyUp);
			this.keyLEFT = game.input.keyboard.addKey(keyLeft);
			this.keyRIGHT = game.input.keyboard.addKey(keyRight);
			this.keyHIT = game.input.keyboard.addKey(keyHit);

			//Player label. Position will be set in the update function.
			this.labelName = game.add.text(0, 0, name);
			this.labelAttack = game.add.text(0, 0, "Attack Mode: ");
			this.hitEnemy = false;
			

			game.physics.add.existing(this, false);
		}	
});

//Giving us the ability to make the new thing a Sprite Object, for Phaser to recognize.
Player.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Player.prototype.constructor = Player;

//Local create function, makes the player's balloons.
Player.prototype.create = function (game) {
	this.balloons = game.physics.add.staticGroup();

	this.balloons.create(0, 0, "balloon");
	this.balloons.create(0, 0, "balloon");

	this.labelName.setAlign('left');
	this.labelName.setFill('#333333');
	this.labelAttack.setAlign('left');
	this.labelAttack.setFill('#333333');
};

//Local update loop, being called from main's update loop, since Phaser 3 does not perform global update broadcasts anymore.
Player.prototype.update = function () {
	
	//Move the player based on what key is being pressed.
	if (this.keyLEFT.isDown) {
		this.body.setVelocityX(-walkSpeed);
		this.anims.play('left', true);
	} else if (this.keyRIGHT.isDown) {
		this.body.setVelocityX(walkSpeed);
		this.anims.play('right', true);
		//	this.loadTexture("characterImageRight");
	} else if (this.body.touching.down) {
		this.anims.play('turn');
		this.body.setVelocityX(0);
	}

	//Jump if the player is touching the ground and presses the spacebar.
	if (this.keyUP.isDown && this.body.touching.down) {
		this.body.setVelocityY(-330);
		playerJumpSound.play();
	} else if (this.keyUP.isDown && !this.body.touching.down && !this.jumpPressed) { //Jump when floating.
		this.body.setVelocityY(100); //to move the character down just a little bit to give a "bouncy" effect.
		this.body.setVelocityY(-330);
		this.jumpPressed = true;
		playerJumpSound.play();
	} else if (!this.keyUP.isDown) {
		this.jumpPressed = false;
	}

	//If the attack key is down, set a bool to true that allows the player to hit the enemy, and reset it with the delayedCall.
	if (this.keyHIT.isDown) {
		this.hitEnemy = true;
		
		var hitEnemyReset = game.time.delayedCall(3000, function () { this.hitEnemy = false; }, [], this);
	}

	//If the character is touching something on it's sides, (usually platforms), it "bounces" into the other direction, to visualize a bouncing effect.
	if (this.body.touching.right) {
		this.body.setVelocityX(-200);
		if (!playerBounceSound.isPlaying) {
			playerBounceSound.play();
		}
	} else if (this.body.touching.left) {
		this.body.setVelocityX(200);
		if (!playerBounceSound.isPlaying) {
			playerBounceSound.play();
		}
	}

	//Make the balloons follow the player
	//TODO look into simplyfying this.
	if (this.balloons.children.entries.length >= 2) {
		this.balloons.children.entries[0].x = this.x + 10; this.balloons.children.entries[0].body.x = this.x + 2;
		this.balloons.children.entries[0].y = this.y - 20; this.balloons.children.entries[0].body.y = this.y - 40;
		this.balloons.children.entries[1].y = this.y - 20; this.balloons.children.entries[1].body.y = this.y - 40;
		this.balloons.children.entries[1].x = this.x - 10; this.balloons.children.entries[1].body.x = this.x - 17;
	} else if(this.balloons.children.entries.length == 1){
		this.balloons.children.entries[0].x = this.x + 10; this.balloons.children.entries[0].body.x = this.x + 2;
		this.balloons.children.entries[0].y = this.y - 20; this.balloons.children.entries[0].body.y = this.y - 40;
	}

	//Sets position of both labels and updates the Attack Mode, to indicate if the player can hit the enemy.
	this.labelName.setPosition(this.x - 35, this.y - 80);
	this.labelAttack.setPosition(this.x - 35, this.y - 60);
	this.labelAttack.setText("Attack Mode: " + this.hitEnemy);
};
