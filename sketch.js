let population;
const lifespan = 200;
let count = 0;
let target;

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
    population = new Population()
    count = 0;
  }

  ellipse(target.x, target.y, 18, 18)
}

class Rocket {
  constructor() {
    this.position = createVector(width / 2, height);
    this.velocity = createVector();
    this.accelation = createVector();
    this.DNA = new DNA();
  }

  applyForce(force) {
    this.accelation.add(force);

  }

  // apply the velocity and acceleration to the position of the element
  update() {
    this.applyForce(this.DNA.genes[count])
    this.velocity.add(this.accelation);
    this.position.add(this.velocity);
    this.accelation.mult(0);
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
    this.populationSize = 50;

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
}

class DNA {
  constructor() {
    this.genes = [];
    for (let i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(0.2)
    }
  }
}