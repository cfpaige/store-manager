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

// create a table to store data returned by the local function checkStock() so it's accessible to runManager():
var stockTable = new Table({
    head: ['Item ID'.cyan, 'Department'.green, 'Product Name'.green, 'Price'.yellow, 'In Stock'.yellow],
})

// create a table to store data returned by checkLow():
var lowTable = new Table({
    head: ['Item ID'.cyan, 'Department'.green, 'Product Name'.green, 'Price'.yellow, 'Low Stock'.yellow],
})

// mini table for checkUpdate():
var checkTable = new Table({
    head: ['Item ID'.cyan, 'Department'.green, 'Product Name'.green, 'Price'.yellow, 'In Stock'.yellow],
})

var selectedId = [];
var getNew = [];

// ======================== GLOBAL FUNCTION =========================

exports.runManager = function runManager() {
    //use inquirer to give choice of broad manager actions:
    inquirer
        .prompt({
            name: 'storeMng',
            type: 'list',
            message: 'Would you like to view ' + '[ALL PRODUCTS]'.yellow + ' for sale, view ' + '[LOW INVENTORY]'.yellow + ' only, ' + '[UPDATE EXISTING]'.yellow + ' products, or ' + '[ADD NEW]'.yellow + ' item? \n' +
            'You can also ' + '[CHANGE ACCESS]'.yellow + ' credentials by going back to login. ' + '[EXIT]'.yellow + ' to quit the store. \n',
            choices: ['ALL PRODUCTS', 'LOW INVENTORY', 'UPDATE EXISTING', 'ADD NEW', 'CHANGE ACCESS', 'EXIT']
        })
        .then(function (answer) {
            var mngrChoice = answer.storeMng;
            switch (mngrChoice) {
                case 'ALL PRODUCTS':
                    checkStock();
                    break;
                case 'LOW INVENTORY':
                    checkLow();
                    break;
                case 'UPDATE EXISTING':
                    updateStock();
                    break;
                case 'ADD NEW':
                    newProduct();
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
 
function checkStock() {
    connection.query('SELECT item_id, department_name, product_name, price, stock_quantity FROM products ORDER BY department_name, item_id',
        function (err, res) {
            if (err) throw err;
            else {
                // fill the global stockTable with query data:
                for (var i = 0; i < res.length; i++) {
                    // this will highligh low stock in red:
                    if (res[i].stock_quantity <= 5) {
                        res[i].stock_quantity = colors.red(res[i].stock_quantity)
                    }
                    stockTable.push(
                        [res[i].item_id, res[i].department_name, res[i].product_name, '$' + (res[i].price).toFixed(2), res[i].stock_quantity]
                    );
                }
                // display the table to the manager and call the next function:
                console.log('\n');
                console.log(stockTable.toString());
                console.log(('\n The products currently in stock are listed in the table above. Low stock quantities in red. \n'.green));
                exports.runManager();
            }
        }
    )
};

function checkLow() {
    connection.query('SELECT item_id, department_name, product_name, price, stock_quantity FROM products WHERE stock_quantity <= 5 ORDER BY item_id', function (err, res) {
        if (err) throw err;
        else {
            // fill the global lowTable variable with query data:
            for (var i = 0; i < res.length; i++) {
                lowTable.push(
                    [res[i].item_id, res[i].department_name, res[i].product_name, '$' + (res[i].price).toFixed(2), colors.red(res[i].stock_quantity)]
                );
            }
            // display the table and call the next function:
            console.log('\n');
            console.log(lowTable.toString());
            console.log(('\n The products running low are listed in the table above. \n'.green));
            exports.runManager();
        }
    })
};


function updateStock() {

    connection.query('SELECT item_id, department_name, product_name, price, stock_quantity FROM products ORDER BY item_id',
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                if (res[i].stock_quantity <= 5) {
                    res[i].stock_quantity = colors.red(res[i].stock_quantity)
                }
                stockTable.push(
                    [res[i].item_id, res[i].department_name, res[i].product_name, '$' + (res[i].price).toFixed(2), res[i].stock_quantity]
                );
            }

            // display the table:
            console.log(stockTable.toString());
            console.log(('\n The products currently in stock are listed in the table above. Low stock quantities in red. \n'.green));
            inquirer
            .prompt({
                type: 'input',
                name: 'itemId',
                message: 'Enter the ID of the item you\'d like to update.',
                validate: function (value) {
                    // make sure the customer can only enter a number, and that the number is larger than zero but no more than available stock:
                    var valid = !isNaN(parseFloat(value));
                    return valid || 'The item ID is the number in the first column of the table above. Please enter the number only.';
                },
                filter: Number
            })
            .then(function (selected, err) {
                if (err) throw err;
                selectedId.push(selected.itemId);
                // ask the manager to set new values for the product:
                newValues();
            });
        });
};

function newValues() {
    connection.query('SELECT department_name, product_name, price, stock_quantity FROM products WHERE ?', { item_id: selectedId }, function (err, res) {
        if (err) throw err;
        inquirer
            .prompt(
                [{
                    type: 'input',
                    name: 'newDept',
                    message: 'Update the department for the ' + (res[0].product_name).green + '?\n' +
                        'Type in the new department name, or press enter to keep it in: ',
                    default: res[0].department_name
                },
                {
                    type: 'input',
                    name: 'newName',
                    message: 'Update the name of the ' + res[0].product_name + '?\n' +
                        'Type new, or press enter to keep the name as: ',
                    default: res[0].product_name
                },
                {
                    type: 'input',
                    name: 'newPrice',
                    message: 'Update the price of the ' + res[0].product_name + '?\n' +
                        'Type new, or confirm current: ',
                    default: res[0].price,
                },
                {
                    type: 'input',
                    name: 'newQuant',
                    message: 'Update the quantity in stock of the ' + res[0].product_name + '?\n' +
                        '(Currently it\'s ' + res[0].stock_quantity + '.)',
                    default: res[0].stock_quantity,
                }])
            .then(function (updated, err) {
                if (err) throw err;
                getNew.push(selectedId[0], updated.newDept, updated.newName, updated.newPrice, updated.newQuant);
                updateQuery();
            });
    })
};

function updateQuery() {
    connection.query('UPDATE products SET ? WHERE ?', [{ department_name: getNew[1], product_name: getNew[2], price: getNew[3], stock_quantity: getNew[4] }, { item_id: getNew[0] }], function (err, res) {
        if (err) throw err;
        console.log('\n Here\'s the updated product:'.green)
    });
    connection.query('SELECT item_id, department_name, product_name, price, stock_quantity FROM products WHERE ?', { item_id: getNew[0] }, function (err, res) {
        if (err) throw err;
        checkTable = [];
        checkTable.push(
            [res[0].item_id, res[0].department_name, res[0].product_name, '$' + (res[0].price).toFixed(2), res[0].stock_quantity]
        );
        // display the table to the manager and call the next function:
        console.log('Here\'s the updated item: \n'.green);
        console.log(checkTable.toString());
        console.log('\n');
        exports.runManager();
    });
};


function newProduct() {
    connection.query(
        'SELECT department_name FROM products GROUP BY department_name', function (err, res) {
            if (err) throw err;
            var depts = [];
            for (i = 0; i < res.length; i++) {
                depts.push(res[i].department_name);
            };
            inquirer
                .prompt(
                    [{
                        type: 'list',
                        name: 'addDept',
                        message: 'Which department are you adding the new product to?',
                        choices: depts
                    },
                    {
                        type: 'input',
                        name: 'addName',
                        message: 'Enter product name:'
                    },
                    {
                        type: 'input',
                        name: 'addPrice',
                        message: 'Add product price per item (numbers only):'
                    },
                    {
                        type: 'input',
                        name: 'addQuant',
                        message: 'Add stock quantity for the new product:'
                    }])
                .then(function (added, err) {
                    if (err) throw err;
                    connection.query('INSERT INTO products SET ?',
                        {
                            department_name: added.addDept,
                            product_name: added.addName,
                            price: added.addPrice,
                            stock_quantity: added.addQuant
                        },
                        function (err, res) {
                            if (err) throw err;
                            connection.query('SELECT item_id, department_name, product_name, price, stock_quantity FROM products WHERE ?', { product_name: added.addName }, function (err, res) {
                                if (err) throw err;
                                checkTable.push(
                                    [res[0].item_id, res[0].department_name, res[0].product_name, '$' + (res[0].price).toFixed(2), res[0].stock_quantity]
                                );
                                // display the table to the manager and call the next function:
                                console.log('Here\'s the new item: \n'.green);
                                console.log(checkTable.toString());
                                console.log('\n');
                                exports.runManager();
                            });
                        }
                    );
                });
        }
    )
};
