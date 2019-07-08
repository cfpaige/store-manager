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


var inventory = [];
var shopping = [];
var purchases = [];
var grandTotal = 0;

// this passes the runCustomer() function to index.js:
exports.runCustomer = function runCustomer() {

    // limit shopping choices by department (to make presentation and flow better):
    connection.query(
        'SELECT department_name FROM products', function (err, res) {
            if (err) throw err;

            // first get all existing department names from the database:
            let dbDepts = [];
            for (var i = 0; i < res.length; i++) {
                dbDepts.push(res[i].department_name)
            };

            // prototype Set filters unique values from an array and into an object; Array.from turns that object back into an array:
            const depts = Array.from(new Set(dbDepts));

            // now ask the customer which depatment they'd like to see:
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'deptChoice',
                    message: 'Which department would you like to shop?',
                    choices: depts
                }
            ])
            // now query the database for all items in the chosen department:
                .then(function (response, err) {
                    if (err) throw err;
                    connection.query('SELECT item_id, product_name, price FROM products WHERE ?',
                        { department_name: response.deptChoice },
                        function (err, res) {
                            // create a table to hold returned items:
                            var table = new Table({
                                head: ['Item ID'.cyan, 'Product Name'.yellow, 'Price'.magenta],
                            })
                            if (err) throw err;
                            else {
                                // fill the table and the inventory array with returned items (the array is declared on top of the script so it's available to all functions):
                                inventory = [];
                                for (var i = 0; i < res.length; i++) {
                                    table.push(
                                        [res[i].item_id, res[i].product_name, "$" + res[i].price]
                                    );
                                    inventory.push(res[i].product_name);
                                }
                            }
                            // display the available options to the customer and call the next function:
                            console.log(('\n Here are the products we stock in ' + response.deptChoice + ':').green);
                            console.log(table.toString());
                            buyItem();
                        })
                })
        })
};

// the function manages the main navigation logic of the customer script:
function buyItem () {
    inquirer
        .prompt({
            type: 'list',
            name: 'browsing',
            message: 'Would you like to shop this department, see another one, or [EXIT]?',
            choices: ['SHOP HERE', 'DIFFERENT DEPARTMENT', 'EXIT']
        })
        .then(function (answer) {
            var aisles = answer.browsing;
            switch (aisles) {
                case 'SHOP HERE':
                    // now call the function that fetches the items from the database:
                    myBasket();
                    break;
                case 'DIFFERENT DEPARTMENT':
                    // go back to the beginning of customer script:
                    exports.runCustomer();
                    break;
                case 'EXIT':
                    if (purchases.length > 0) {
                        var shopTable = new Table({
                            head: ['Product Name'.green, 'Unit Price'.yellow, 'Quantity'.yellow, 'Total'.magenta],
                        })
                        for (var i = 0; i < purchases.length; i++) {
                            shopTable.push(
                                [purchases[i].itemName, "$" + purchases[i].itemPrice, purchases[i].itemQuant, "$" + purchases[i].itemTotal]
                            );
                        }
                        console.log(shopTable.toString());
                        console.log('\n' + 'You have spent a total of $' + grandTotal.toFixed(2) + ' today. \n\n' +
                        'Thanks for visiting BAMAZON! Please come again soon!'.yellow + '\n');
                        connection.end();
                        process.exit();
                    } else {
                        console.log('\n' + 'Thanks for visiting BAMAZON! Please come again soon!'.yellow + '\n');
                        connection.end();
                        process.exit();
                    }
            }
        })
        .catch(error => console.log(error));
};

// this function will walk the customer through the purchase proper from item choice to final confirmation:
function myBasket() {
    inquirer
        .prompt({
            type: 'list',
            name: 'buyItem',
            message: 'Which item would you like to buy?',
            // calls back the array created by the  runCustomer() function:
            choices: inventory
        })
        .then(function (choice, err) {
            if (err) throw err;
            // check the quantity the customer can buy by fetching item stock level from the database:
            connection.query('SELECT product_name, stock_quantity, price FROM products WHERE ?',
                { product_name: choice.buyItem },
                function (err, res) {
                    // variables to reuse in later functions:
                    var inStock = parseInt(res[0].stock_quantity);
                    var itemPrice = parseFloat(res[0].price);
                    var itemName = res[0].product_name;
                    // console.log(typeof(itemName));
                    // console.log(itemName);
                    inquirer
                        .prompt({
                            type: 'input',
                            name: 'quantity',
                            message: 'We have ' + inStock + ' in stock. How many would you like to buy?',
                            validate: function (value) {
                                // make sure the customer can only enter a number, and that the number is larger than zero but no more than available stock:
                                var valid = !isNaN(parseFloat(value)) && parseInt(value) > 0 && parseInt(value) <= inStock;
                                return valid || 'Please enter a valid quantity';
                            },
                            filter: Number
                        })
                        .then(function (amount, err) {
                            if (err) throw err;
                            var itemQuant = parseInt(amount.quantity);
                            var itemTotal = parseFloat((itemPrice * itemQuant).toFixed(2));
                            inquirer
                                .prompt({
                                    type: 'confirm',
                                    name: 'payUp',
                                    message: 'Your total is $' + itemTotal + ' Confirm purchase?',
                                    // 'default: true' means the purchase can be finalized by just pressing Enter:
                                    default: true
                                })
                                .then(function (confirm, err) {
                                    if (err) throw err;
                                    // if the customer went ahead with purchase, call the function that updates the database:
                                    if (confirm.payUp) {
                                        shopping = {'itemName': itemName, 'inStock': inStock, 'itemQuant': itemQuant, 'itemPrice': itemPrice, 'itemTotal': itemTotal}
                                        purchases.push(shopping);
                                        grandTotal = grandTotal + itemTotal;
                                        checkout();
                                    } else {
                                        // if the customer changed their mind, call the main navigation function again:
                                        console.log('No problem! Let\'s try something else.');
                                        buyItem();
                                    }
                                })
                        })
                }
            )
        })
        .catch(error => console.log(error));
};

// if the customer went ahead with the purchase, update the stock levels in the database:
function checkout () {
    connection.query(
        "UPDATE products SET ? WHERE ?",
    [
        {stock_quantity: shopping.inStock - shopping.itemQuant},
        {product_name: shopping.itemName}
    ],
    function (err, res) {
        if (err) throw err;
        else {
            // empty the variable so it's ready to be used with the next item if the customer wants to keep shopping:
            console.log('\n Thank you for your purchase of ' + colors.yellow(shopping.itemQuant) + ' of ' + colors.green(shopping.itemName) + ' at ' +  colors.yellow('$' + shopping.itemPrice) + ' each. (Your total for this item is ' + colors.magenta.underline('$' + shopping.itemTotal) + '.) \n')
            shopping = [];
            buyItem();
        }}
    )
};