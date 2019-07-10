// main logic packages:
var inquirer = require('inquirer');
var mysql = require('mysql');

// app specific constructors:
var Cust = require('./js/customer');
var Mngr = require('./js/manager.js');
var Supr = require('./js/supervisor.js');

// display packages:
const colors = require('colors');
const clear = require('clear');
const figlet = require('figlet');

// ========================== INTRO BANNER ==========================

// at launch, clear the screen and display the app's name:
clear();
console.log(
  figlet.textSync('Welcome  to  BAMAZON!', { horizontalLayout: 'full' }).rainbow
);
console.log('\n' + 'Your go-to destination for all things dinosaur!'.green + '\n');

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

// ========================== CHECK PASSWORD ========================

// this is passed from runStore() below to check for credentials:
function checkPassword() {
  inquirer
    .prompt({
      type: 'password',
      name: 'employeePass',
      message: 'Enter your password:',
      mask: '*'
    })
    .then(function (user) {
      if (user.employeePass === 'managerView') {
        // show the manager view (in the manager.js script):
        Mngr.runManager();
      }
      else if (user.employeePass === 'superView') {
        // show the supervisor view (in the supervisor.js script):
        Supr.runSuper();
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
                Cust.runCustomer();
                break;
              case 'EXIT':
                console.log('\n' + 'Thanks for visiting BAMAZON! Please come again soon!'.yellow + '\n');
                break;
            };
          });
      };
    })
    .catch(error => console.log(error));
};

// ============================== MAIN ==============================

// the one function to rule them all (exporting so it's available to other scripts:):
exports.runStore = function runStore() {
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
          Cust.runCustomer();
          break;
        case 'MANAGER':
          checkPassword();
          // for testing purposes, I commented out the checkPassword() and ran the required scripts immediately:
          // Mngr.runManager();
          break;
        case 'SUPERVISOR':
          checkPassword();
          // for testing purposes, I commented out the checkPassword() and ran the required scripts immediately:
          // Supr.runSuper();
          break;
        case 'EXIT':
          console.log('\n' + 'Thanks for visiting BAMAZON! Please come again soon!'.yellow + '\n');
          connection.end();
          process.exit();
      }
    })
    .catch(error => console.log(error));
};

// ================== LET'S GET THE BALL ROLLING! ===================

connection.connect(function (err) {
  if (err) throw err;
  exports.runStore();
});