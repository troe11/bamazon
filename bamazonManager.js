var inquirer = require('inquirer');
var mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,

    user: 'root',

    password: '',
    database: 'bamazon'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadID);
    mrManager();
});

var mrManager = function() {
        inquirer.prompt([{
                type: 'list',
                message: 'What would you like to do Mr. Manager?',
                choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add new Product'],
                name: 'choice'
            }]).then(function(mess) {
                    switch (mess.choice) {
                        case 'View Products for Sale':
                            connection.query('select * from products', (err, res) => {
                                if (err) throw err;
                                for (let i = 0; i < res.length; i++) {
                                    console.log('Product name: ' + res[i].product_name + '\nDepartment: ' + res[i].department_name + '\nPrice: ' + res[i].price + '\nQuantity remaining: ' + res[i].stock_quantity + '\n');
                                }
                                mrManager();
                            })
                            break;
                        case 'View Low Inventory':
                            connection.query('select * from products', (err, res) => {
                                if (err) throw err;
                                for (let i = 0; i < res.length; i++) {
                                    if (res[i].stock_quantity < 5) {
                                        console.log('Product name: ' + res[i].product_name + '\nDepartment: ' + res[i].department_name + '\nPrice: ' + res[i].price + '\nQuantity remaining: ' + res[i].stock_quantity + '\n');
                                    }
                                }
                                mrManager();
                            })
                            break;
                        case 'Add new Product':
                            inquirer.prompt([{
                                type: 'input',
                                message: 'What is the name of the product you are adding?',
                                name: 'prodName'
                            }, {
                                type: 'input',
                                message: 'How many did you acquire?',
                                name: 'prodInv'
                            }, {
                                type: 'input',
                                message: 'How much are you selling it for?',
                                name: 'prodPrice'
                            }, {
                                type: 'input',
                                message: 'What department?',
                                name: 'prodDept'
                            }]).then(function(inv) {
                                connection.query('insert into products(product_name,department_name,price,stock_quantity) values(?,?,?,?)', [inv.prodName, inv.prodDept, parseFloat(inv.prodPrice), parseFloat(inv.prodInv)], (err) => {
                                    if (err) throw err;
                                    console.log('Product added!');
                                    mrManager();
                                })
                            })
                            break;
                        case 'Add to Inventory':
                            inquirer.prompt([{
                                type: 'input',
                                message: 'Select the ItemID to which you are adding inventory: ',
                                name: 'product'
                            }]).then(function(inv) {
                                    connection.query('select * from products where item_id=?', inv.product, (err, res) => {
                                        if (!res) {
                                            console.log('You do not have that item in your inventory!');
                                            mrManager();
                                        } else {
                                            var prodID = res[0].item_id;
                                            var prodQuant = res[0].stock_quantity;
                                            console.log(prodID,prodQuant)
                                            inquirer.prompt([{
                                                type:'input',
                                                message:'How much inventory would you like to add?',
                                                name:'newInv'
                                            }]).then(function(prods){
                                                connection.query('update products set stock_quantity=? where item_id=?',[parseFloat(prodQuant)+parseFloat(prods.newInv),prodID],(err)=>{
                                                    console.log('Done!');
                                                    mrManager();
                                                })
                                            })
                                            
                                        }
                                    })
                                })
                            break;
                        }})};