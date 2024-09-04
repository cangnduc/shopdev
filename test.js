const Car = function (make, speed) {
  this.make = make;
  this.speed = speed;
};
Car.prototype.introduce = function () {
  console.log(`${this.make} is going at ${this.speed} km/h`);
};
const EV = function (make, speed, charge) {
  Car.call(this, make, speed);
  this.charge = charge;
};

EV.prototype = Object.create(Car.prototype);
EV.prototype.constructor = EV;
EV.prototype.chargeBattery = function (chargeTo) {
  this.charge = chargeTo;
};
EV.prototype.accelerate = function () {
  this.speed += 20;
  this.charge--;
  console.log(
    `${this.make} is going at ${this.speed} km/h, with a charge of ${this.charge}`
  );
};
console.dir(EV);
const tesla = new EV("Tesla", 120, 23); // Tesla is going at 120 km/h, with a charge of 23
tesla.accelerate(); // Tesla is going at 140 km/h, with a charge of 22
tesla.accelerate(); // Tesla is going at 160 km/h, with a charge of 21
tesla.chargeBattery(90); // charge is now 90

tesla.introduce(); // Tesla is going at 160 km/h
console.log();

class Account {
  constructor(owner, currency, pin) {
    this.owner = owner;
    this.currency = currency;
    this.pin = pin;
    this.movements = [];
    this.locale = navigator.language;
    console.log(`Thanks for opening an account, ${owner}`);
  }
}

const acc1 = new Account("Jonas", "EUR", 1111);

class Vichle {
  constructor(make, speed) {
    this._make = make;
    this.speed = speed;
  }
  introduce() {
    console.log(`${this._make} is going at ${this.speed} km/h`);
  }
  get make() {
    return this._make;
  }
  set make(newMake) {
    this._make = newMake;
  }
}

const bicycle = new Vichle("Mercedes", 120);
console.log(bicycle.make); // undefined
