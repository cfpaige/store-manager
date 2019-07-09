// var Redo is being exported here to allow customer.js to access the runStore() function in index.js:
var Redo = require('../index.js')
var Table = require('cli-table3');
var colors = require('colors');
var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection
    ({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'bamazon_db'
    });



exports.runSuper = function runSuper () {
    console.log('Welcome! Goodbye!'.yellow);
    process.exit();
};