// Get the canvas element
const canvas = document.getElementById('pong');

// Get the 2D drawing context
const ctx = canvas.getContext('2d');

// Hide cursor
canvas.style.cursor = 'none';

class Vector {
	constructor(angle = 0) {
		this.angle = angle;
		this.x = Math.cos(angle);
		this.y = Math.sin(angle);
	}
}

class Player {
	constructor(x, y, width = 75, height = 20, color = 'white') {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.score = 0;
	}

	draw() {
		drawRect(this.x, this.y, this.width, this.height, this.color);
	}
}

class Ball {
	constructor(x, y, width = 20, height = 20, speed = 10, vector = new Vector(Math.PI / 3), color = 'white') {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.vector = vector;
		this.color = color;
	}

	draw() {
		drawRect(this.x, this.y, this.width, this.height, this.color);
	}

	drawCircle() {
		drawCircle(this.x, this.y, this.width / 2, this.color);
	}
}

const ball = new Ball(canvas.width / 2 - 10, canvas.height / 2 - 10);
const player = new Player((canvas.width / 2) - (75 / 2), canvas.height - 40);
const opponent = new Player((canvas.width / 2) - (75 / 2), 20);

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, radius, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
}

function collisionPlayer(paddle) {
	let ballCenter = {
		x: ball.x + (ball.width / 2),
		y: ball.y + (ball.height / 2)
	};

	let playerCenter = {
		x: paddle.x + (paddle.width / 2),
		y: paddle.y + (paddle.height / 2)
	};

	let hitPoint = {
		x: ballCenter.x - playerCenter.x,
		y: ballCenter.y - playerCenter.y
	};

	// if distance between ball and player is less than the sum of their radius
	if (!(Math.abs(hitPoint.x) < (ball.width / 2) + (paddle.width / 2) &&
		Math.abs(hitPoint.y) < (ball.height / 2) + (paddle.height / 2))) {
		return false;
	}

	// Calculate the angle the ball should bounce
	let angle = Math.atan2(hitPoint.y, hitPoint.x);

	// Change the ball direction
	ball.vector = new Vector(angle);

	// calculate the overlap
	let overlap = {
		x: (ball.width / 2) + (paddle.width / 2) - Math.abs(hitPoint.x),
		y: (ball.height / 2) + (paddle.height / 2) - Math.abs(hitPoint.y)
	}

	if (overlap.x > 0 && overlap.y > 0) {
		if (overlap.x < overlap.y) {
			if (ballCenter.x < playerCenter.x) {
				ball.x -= overlap.x;
			} else {
				ball.x += overlap.x;
			}
		} else {
			if (ballCenter.y < playerCenter.y) {
				ball.y -= overlap.y;
			} else {
				ball.y += overlap.y;
			}
		}
	}

	ball.speed += 0.5;
}

function aiMove() {
	let diff = ball.x - opponent.x - opponent.width / 2;
	if (diff < 0 && opponent.x > 0) {
		if (diff < -10) {
			opponent.x -= 10;
		} else {
			opponent.x += diff;
		}
	} else if (diff > 0 && opponent.x + opponent.width < canvas.width) {
		if (diff > 10) {
			opponent.x += 10;
		} else {
			opponent.x += diff;
		}
	}
}

function bounceBall() {
	aiMove();

	collisionPlayer(player);
	collisionPlayer(opponent);

	if (ball.x + ball.width > canvas.width) {
		ball.vector = new Vector(Math.PI - ball.vector.angle);
		ball.x = canvas.width - ball.width;
	}
	if (ball.x < 0) {
		ball.vector = new Vector(Math.PI - ball.vector.angle);
		ball.x = 0;
	}

	if (ball.y > canvas.height - ball.height) {
		opponent.score++;
		resetBall();
	}

	if (ball.y < 0) {
		player.score++;
		resetBall();
	}
}

const keys = {
	a: false,
	d: false,
	ArrowLeft: false,
	ArrowRight: false
};

function movePaddle() {
	if (keys['a']) {
		if (player.x > 0) {
			player.x -= 10;
		}
	}
	if (keys['d']) {
		if (player.x + player.width < canvas.width) {
			player.x += 10;
		}
	}
	if (keys['ArrowLeft']) {
		if (opponent.x > 0) {
			opponent.x -= 10;
		}
	}
	if (keys['ArrowRight']) {
		if (opponent.x + opponent.width < canvas.width) {
			opponent.x += 10;
		}
	}
}

let lastTime = Date.now();

function update() {
	movePaddle();

	bounceBall();

	let currentTime = Date.now();
	let deltaTime = (currentTime - lastTime) / 20;
	lastTime = currentTime;

	ball.x += ball.vector.x * ball.speed * deltaTime;
	ball.y += ball.vector.y * ball.speed * deltaTime;

}

function resetBall() {
	ball.x = canvas.width / 2 - 10;
	ball.y = canvas.height / 2 - 10;
	ball.speed = 10;
	ball.vector = new Vector(Math.PI / 3);
}

function reset() {
	resetBall();

	player.score = 0;
	opponent.score = 0;

	player.x = (canvas.width / 2) - (75 / 2);
	opponent.x = (canvas.width / 2) - (75 / 2);
}

function drawNet(color) {
	for (let i = 60; i < canvas.width - 60; i += 30) {
		drawRect(i, canvas.height / 2, 10, 5, color);
	}
}

function render() {
	// Clear the canvas
	drawRect(0, 0, canvas.width, canvas.height, '#313131');

	// Draw net
	drawNet('white');

	// Draw scores
	ctx.fillStyle = 'darkgray';
	ctx.font = '100px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(player.score, canvas.width / 2, (canvas.height / 4) * 3 + 50);
	ctx.fillText(opponent.score, canvas.width / 2, canvas.height / 4 + 50);

	// Draw paddles
	player.draw();
	opponent.draw();

	// Draw ball
	ball.draw();
}

function gameLoop() {
	update();
	render();
}

setInterval(gameLoop, 1000 / 60); // 60 FPS

function mouseMoveHandler(event) {
	let relativeX = event.clientX - canvas.offsetLeft;
	if (relativeX > 0 && relativeX < canvas.width) {
		player.x = relativeX - player.width / 2;
	}
}

function keyDownHandler(event) {
	if (event.key in keys) {
		keys[event.key] = true;
	}
	if (event.key === 'r') {
		reset();
	}
	if (event.key === '-') {
		ball.speed -= 1;
	}
	if (event.key === '=') {
		ball.speed += 1;
	}
}

function keyUpHandler(event) {
	if (event.key in keys) {
		keys[event.key] = false;
	}
}

addEventListener('keydown', keyDownHandler);
addEventListener('keyup', keyUpHandler);

addEventListener('mousemove', mouseMoveHandler);

