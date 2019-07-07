// main logic packages:
var inquirer = require('inquirer');
var mysql = require('mysql');
// require('dotenv').config(); - this doesn't seem to work - why not??

// app specific constructors:
var customer = require('./customer.js');
var manager = require('./manager.js');
var supervisor = require('./supervisor.js');

// display packages:
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

// ========================== INTRO BANNER ==========================

// at launch, clear the screen and display the app's name:
clear();
console.log(
  chalk.magenta(
    figlet.textSync('Welcome  to  BAMAZON!', { horizontalLayout: 'full' })
  )
);
console.log(
    chalk.yellow('\n' + 'Your go-to destination for all things dinosaur!' + '\n\n')
  );

// ==================================================================

// next, connect to the database:
var connection = mysql.createConnection({
    host: 'localhost',

// use the name of your own port (may be different - you'll find it on the home page of your MySQL Workbench under MySQL Connections):
  port: 3306,
// use your own MySQL user ID here:
  user: 'root',

// and your own password and database name:
  password: 'password',
  database: 'bamazon_db'
});

// this doesn't work - why not?? (seems mysql doesn't recognize dotenv methods)
// var connection = mysql.createConnection({
//     host     : process.env.DB_HOST,
//     user     : process.env.DB_USER,
//     password : process.env.DB_PASS,
//     database : process.env.DB_NAME
//   });

connection.connect(function (err) {
    if (err) throw err;
    // console.log(`Your port is ${port}`) - this doesn't work - why not?? (jQuery.noConflict() doesn't help either - seems mysql is overriding other packages)
    // console.log('connected as id ' + connection.threadId);
    runStore();
    connection.end()
});

// ======================= TEST CODE - IGNORE =======================

// testing that runStore() and checkPassword() both work before linking to external scripts:
// function runCustomer() {
//   console.log(
//     chalk.blue('Welcome')
//   );
// };

// function runManager() {
//   console.log(
//     chalk.blue('Welcome')
//   );
// };

// function runSuper() {
//   console.log(
//     chalk.blue('Welcome')
//   );
// };

// ========================== CHECK PASSWORD ========================

// this is passed from runStore() below to check for credentials:
function checkPassword() {
  inquirer.prompt({
    type: 'password',
    name: 'employeePass',
    message: 'Enter your password:'
  }).then(function (user) {
    if (user.employeePass === 'managerView') {
      // show the manager view (in the manager.js script):
      runManager();
    }
    else if (user.employeePass === 'superView') {
      // show the supervisor view (in the supervisor.js script):
      runSuper();
    }
    else {
      inquirer
        .prompt({
          name: 'wrongPass',
          type: 'list',
          message: 'Wrong password. Would you like to [TRY AGAIN], enter as a [CUSTOMER] or [EXIT]?',
          choices: ['TRY AGAIN', 'CUSTOMER', 'EXIT']
        })
        .then(function (user) {
          var userPass = user.wrongPass;
          switch (userPass) {
            case 'TRY AGAIN':
              checkPassword();
              break;
            case 'CUSTOMER':
              runCustomer();
              break;
            case 'EXIT':
              console.log(
                chalk.yellow('\n' + 'Thanks for visiting! Please come again soon!' + '\n\n')
              );
              break;
          };
        });
    };
  })
  .catch(error => console.log(error));
};

// ============================== MAIN ==============================

// the one function to rule them all:
function runStore() {
  // first use inquirer to check if customer or employee:
  inquirer
    .prompt({
      name: 'storeView',
      type: 'list',
      message: 'Would you like to enter the store as a [CUSTOMER], [MANAGER] or [SUPERVISOR]?',
      choices: ['CUSTOMER', 'MANAGER', 'SUPERVISOR', 'EXIT']
    })
    .then(function (answer) {
      var userChoice = answer.storeView;
      switch (userChoice) {
        case 'CUSTOMER':
          runCustomer();
          break;
        case 'MANAGER':
          checkPassword();
          break;
        case 'SUPERVISOR':
          checkPassword();
          break;
        case 'EXIT':
          console.log(
            chalk.yellow('\n' + 'Thanks for visiting! Please come again soon!' + '\n\n')
          );
          break;
      }
    })
    .catch(error => console.log(error));
};