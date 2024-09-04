type UserType = {
  name: string;
  age: number;
  getName(): string;
  getAge(): number;
};

const User = function (name: string, age: number) {
  this.name = name;
  this.age = age;
};

User.prototype.getName = function () {
  return this.name;
};

User.prototype.getAge = function () {
  return this.age;
};

const john = new User("John", 30);
console.log("User: ", john);
console.log("User.getName(): ", user.getName());
console.log("User.getAge(): ", user.getAge());
