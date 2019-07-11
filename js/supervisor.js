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

// ======================== GLOBAL VARIABLES ========================

var salesTable = new Table({
    head: ['ID'.cyan, 'Department'.cyan, 'Overhead Cost'.magenta, 'Total Sales'.green, 'Profit'.yellow],
})

var addedTable = new Table({
    head: ['ID'.cyan, 'Department'.yellow, 'Overhead Cost'.magenta],
})

var tempDeptID = [];

// ======================== GLOBAL FUNCTION =========================

exports.runSuper = function runSuper() {
    //use inquirer to give choice of broad manager actions:
    inquirer
        .prompt({
            name: 'suprStore',
            type: 'list',
            message: 'Would you like to ' + '[VIEW SALES] by department'.yellow + ', or [ADD NEW] department'.yellow + '? \n' +
                'You can also ' + '[CHANGE ACCESS]'.yellow + ' credentials by going back to login. ' + '[EXIT]'.yellow + ' to quit the store. \n',
            choices: ['VIEW SALES', 'ADD NEW', 'CHANGE ACCESS', 'EXIT']
        })
        .then(function (answer) {
            var suprChoice = answer.suprStore;
            switch (suprChoice) {
                case 'VIEW SALES':
                    salesView();
                    break;
                case 'ADD NEW':
                    newDept();
                    break;
                case 'CHANGE ACCESS':
                    // this passes it back to index.js:
                    Redo.runStore();
                    break;
                case 'EXIT':
                    console.log('\n' + 'Session over. Enter <node index.js> to run again.'.yellow + '\n');
                    connection.end();
                    process.exit();
            }
        })
        .catch(error => console.log(error));
};

// ======================== LOCAL FUNCTIONS =========================
function salesView() {
    connection.query('SELECT department_id, department_name, over_head_costs, SUM(product_sales) AS department_total, SUM(product_sales)-over_head_costs AS department_profit FROM (SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales FROM departments LEFT JOIN products ON departments.department_name = products.department_name) AS selected GROUP BY department_name',
        function (err, res) {
            if (err) throw err;
            else {
                for (var i = 0; i < res.length; i++) {
                    // turn results into valid decimals:
                    res[i].over_head_costs = (parseFloat(res[i].over_head_costs)).toFixed(2);
                    // for departments without products, validate so it doesn't display isNan instead of 0:
                    if (!isNaN(parseFloat(res[i].department_total))) {
                    // if it's a number, make it a decimal:
                        res[i].department_total = (parseFloat(res[i].department_total)).toFixed(2);
                    } else {
                        // if not, make it a 0, then subtract overheads from 0 to create a dept profit value for this dept:
                        res[i].department_total = 0;
                        res[i].department_profit = 0 - res[i].over_head_costs;
                    };
                    // if profit below 0, highlight in red:
                    if (res[i].department_profit < 0) {
                        res[i].department_profit = colors.red((parseFloat(res[i].department_profit)).toFixed(2));
                    };
                    salesTable.push([res[i].department_id, res[i].department_name, '$' + res[i].over_head_costs, '$' + res[i].department_total, res[i].department_profit]);
                }
                console.log(salesTable.toString());
                console.log('Store departments listed above. Those not making profit are in red.'.green + '\n\n' + 'Next,');
                exports.runSuper();
            }
        })
};

function newDept() {
    connection.query('SELECT department_id, department_name FROM departments ORDER BY department_id', function (err, res) {
        if (err) throw err;
        // create tempDeptID to avoid duplicating department names (otherwise MySQL throws an error)
        for (var i = 0; i < res.length; i++) {
            tempDeptID = [];
            if (i === res.length - 1) {
                tempDeptID.push(res[i].department_id + 1);
            }
        }
        inquirer
            .prompt(
                [{
                    name: 'addDept',
                    message: 'What is the name of the department you\'re adding?',
                    // add temporary ID here
                    default: 'New Department #' + tempDeptID
                },
                {
                    name: 'addCosts',
                    message: 'What are the projected overhead costs?',
                    default: 0
                }])
            .then(function (newD, err) {
                if (err) throw err;
                var deptCosts = (parseFloat(newD.addCosts)).toFixed(2);
                connection.query('INSERT INTO departments SET ?',
                    {
                        department_name: newD.addDept,
                        over_head_costs: deptCosts
                    },
                    function (err, res) {
                        console.log('deptName: ' + newD.addDept)
                        if (err) throw err;
                        connection.query('SELECT * FROM departments WHERE ?', { department_name: newD.addDept }, function (err, response) {
                            if (err) throw err;
                            response[0].over_head_costs = (parseFloat(response[0].over_head_costs)).toFixed(2)
                            addedTable.push(
                                [response[0].department_id, response[0].department_name, '$' + response[0].over_head_costs]
                            );
                            //     // display the table to the manager and call the next function:
                            console.log('\n Here\'s the new item:'.green);
                            console.log(addedTable.toString());
                            console.log('\n Next,');
                            exports.runSuper();
                        })
                    }
                )
            })
    })
};