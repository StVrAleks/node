function User(name, age){
      
    this.name = name;
    this.age = age;
    this.print = function(){
        console.log(`Имя: ${this.name}  Возраст: ${this.age}`);
    }
}
User.prototype.sayHi = function() {
    console.log(`Привет, меня зовут ${this.name}`);
};
  
module.exports = User;