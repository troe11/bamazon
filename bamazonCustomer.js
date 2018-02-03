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
    checkDB();
})

var checkDB = () => {
    connection.query('select * from products', (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log('Product name: ' + res[i].product_name + '\nDepartment: ' + res[i].department_name + '\nPrice: ' + res[i].price + '\nQuantity remaining: ' + res[i].stock_quantity + '\n');
        }
        customerQuery();
    })
}

var customerQuery = () => {
    inquirer.prompt([{
        type: 'input',
        message: 'What product ID would you like to search for?',
        name: 'product'
    }]).then(function(mess) {

        connection.query('select * from products where item_id=?', mess.product, (err, res) => {
            if (err) throw err;
            console.log('Product name: ' + res[0].product_name + '\nDepartment: ' + res[0].department_name + '\nPrice: ' + res[0].price + '\nQuantity remaining: ' + res[0].stock_quantity + '\n');

            inquirer.prompt([{
                type: 'input',
                message: 'How many would you like to buy?',
                name: 'quantity'
            }]).then(function(quant) {
                if (quant.quantity > res[0].stock_quantity) {
                    console.log('Insufficient quantity!');
                    customerQuery();
                } else {
                    var price = res[0].price;
                    connection.query('update products set stock_quantity=? where item_id=?', [res[0].stock_quantity - quant.quantity, mess.product], (err, res) => {
                        if (err) throw err;
                        console.log('Quantity updated!');
                        console.log('Total cost: '+ quant.quantity*price)
                        customerQuery();
                    });
                }
            })
        })

    })
}