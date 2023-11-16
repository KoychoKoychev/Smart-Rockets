let population;
const lifespan = 400;
let count = 0;
let target;
const maxForce = 0.3;

const rx = 100;
const ry = 250;
const rw = 200;
const rh = 10;

function setup() {
	createCanvas(400, 400);
	population = new Population();
	target = createVector(width / 2, 50)
}

function draw() {
	background(220);
	population.run();
	count++;

	let alivePopulation = population.rockets.find(rocket => !rocket.completed && !rocket.crashed)

	if (count == lifespan || !alivePopulation) {
		population.evaluate();
		population.selection();
		count = 0;
	}

	fill(255)
	rect(rx, ry, rw, rh)

	ellipse(target.x, target.y, 18, 18)
}

class Rocket {
	constructor(dna) {
		this.position = createVector(width / 2, height);
		this.velocity = createVector();
		this.accelation = createVector();
		this.completed = false;
		this.crashed = false;
		this.timeLived = 1;
		this.distanceToTarget = Number.MAX_SAFE_INTEGER

		if (dna) {
			this.DNA = dna
		} else {
			this.DNA = new DNA();
		}
		this.fitness = 0;
	}

	applyForce(force) {
		this.accelation.add(force);
	}

	calculateFitness() {
		this.fitness = map(this.distanceToTarget, 0, width, width, 0) * 2;
		if (this.completed) {
			this.fitness *= 10;
			this.fitness /= (this.timeLived / lifespan )

		}
		if (this.crashed) {
			this.fitness /= 3;
			this.fitness *= ( this.timeLived / lifespan )
		}
	}

	// apply the velocity and acceleration to the position of the element
	update() {

		const d = dist(this.position.x, this.position.y, target.x, target.y)
		if (d < this.distanceToTarget) this.distanceToTarget = d

		if (d < 10) {
			this.completed = true;
			this.position = target.copy();
		}

		if (this.position.x > rx && this.position.x < rx + rw && this.position.y > ry && this.position.y < ry + rh) {
			this.crashed = true;
		}

		if (this.position.x > width || this.position.x < 0) {
			this.crashed = true;
		}
		if (this.position.y > height || this.position.y < 0) {
			this.crashed = true;
		}

		this.applyForce(this.DNA.genes[count])
		if (!this.completed && !this.crashed) {
			this.velocity.add(this.accelation);
			this.position.add(this.velocity);
			this.accelation.mult(0);
		} else {
			this.timeLived = count;
		}
	}

	show() {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());
		rectMode(CENTER);
		rect(0, 0, 25, 5);
		pop();
	}

}

class Population {
	constructor() {
		this.rockets = [];
		this.populationSize = 100;
		this.matingPool = [];

		for (let i = 0; i < this.populationSize; i++) {
			this.rockets[i] = new Rocket;
		}
	}

	run() {
		for (let i = 0; i < this.populationSize; i++) {
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}

	evaluate() {

		let maxFitness = 0;
		for (let i = 0; i < this.populationSize; i++) {
			this.rockets[i].calculateFitness();
			if (this.rockets[i].fitness > maxFitness) {
				maxFitness = this.rockets[i].fitness
			}
		}

		for (let i = 0; i < this.populationSize; i++) {
			this.rockets[i].fitness /= maxFitness;
		}

		this.matingPool = [];

		for (let i = 0; i < this.populationSize; i++) {
			const n = this.rockets[i].fitness * 100;
			for (let j = 0; j < n; j++) {
				this.matingPool.push(this.rockets[i])
			}
			this.rockets[i].fitness /= maxFitness;
		}
	}

	selection() {
		let indexA = Math.floor(Math.random() * this.matingPool.length)
		let indexB = Math.floor(Math.random() * this.matingPool.length)

		const newRockets = [];
		for (let i = 0; i < this.rockets.length; i++) {
			let parentA = this.matingPool[indexA].DNA;
			let parentB = this.matingPool[indexB].DNA;
			let child = parentA.crossover(parentB);
			if (this.matingPool[indexA].completed || this.matingPool[indexB].completed) {
				child.mutation(0.005);
			} else {
				child.mutation(0.03);
			}
			newRockets[i] = new Rocket(child)
		}

		this.rockets = newRockets;
	}
}

class DNA {
	constructor(genes) {
		if (genes) {
			this.genes = genes;
		} else {
			this.genes = []
			for (let i = 0; i < lifespan; i++) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce)
			}
		}
	}

	crossover(partner) {
		const newGenes = [];
		const mid = Math.floor(Math.random() * this.genes.length)
		for (let i = 0; i < this.genes.length; i++) {
			if (i > mid) {
				newGenes[i] = this.genes[i];
			} else {
				newGenes[i] = partner.genes[i];
			}
		}
		return new DNA(newGenes);
	}

	mutation(magnitude = 0.02) {
		for (let i = 0; i < this.genes.length; i++) {
			if (Math.random() < magnitude) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce)
			}
		}
	}
}