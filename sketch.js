let population;
const lifespan = 200;
let count = 0;
let target;

// TODO Add an obsticle for the rockets to go around!

function setup() {
  createCanvas(400, 400);
  population = new Population();
  target = createVector(width / 2, 50)
}

function draw() {
  background(220);
  population.run();
  count++;

  if (count == lifespan) {
    population.evaluate();
    population.selection();
    count = 0;
  }

  ellipse(target.x, target.y, 18, 18)
}

class Rocket {
  constructor(dna) {
    this.position = createVector(width / 2, height);
    this.velocity = createVector();
    this.accelation = createVector();
    this.completed = false;
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
    const d = dist(this.position.x, this.position.y, target.x, target.y)
    this.fitness = map(d, 0, width, width, 0);
    if (this.completed) {
      this.fitness *= 10;
    }
  }

  // apply the velocity and acceleration to the position of the element
  update() {

    const d = dist(this.position.x, this.position.y, target.x, target.y)
    if (d < 10) {
      this.completed = true;
      this.position = target.copy();
    }
    this.applyForce(this.DNA.genes[count])
    if (!this.completed){
      this.velocity.add(this.accelation);
      this.position.add(this.velocity);
      this.accelation.mult(0);
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
      child.mutation();
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
        this.genes[i].setMag(0.2)
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

  mutation() {
    for (let i = 0; i < this.genes.length; i++) {
      if (Math.random() < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(0.2)
      }
    }
  }
}