const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

// Create express app
const app = express();
const port = 3000;

// Create pool
const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
});

// Add process hook to shutdown pool
process.on('SIGINT', function() {
    pool.end();
    console.log('Application successfully shutdown');
    process.exit(0);
});

app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    const data = {name: 'Mario'};
    res.render('index', data);
});

app.get('/user', (req, res) => {
    teammembers = []
    pool
        .query('SELECT * FROM employees;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                teammembers.push(query_res.rows[i]);
            }
            const data = {teammembers: teammembers};
            console.log(teammembers);
            res.render('user', data);
        });
});

app.get('/menu', (req, res) => {
    item_categories = []
    pool
        .query('SELECT DISTINCT item_category FROM items;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                item_categories.push(query_res.rows[i]);
            }
            const data = {data: item_categories};
            res.render('menu', data);        
        });
});

app.get('/menu/:category', (req, res) => {
    const category = req.params.category;
    item_categories = []
    pool
        .query('SELECT DISTINCT base_item FROM items WHERE item_category=$1;', [category])
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                item_categories.push(query_res.rows[i]);
            }
            const data = {data: item_categories};
            res.render('items', data);
        });
});

app.get('/menu/:category/:item', (req, res) => {
    const category = req.params.category;
    const item = req.params.item;
    item_categories = []
    pool
        .query('SELECT * FROM items WHERE item_category=$1 AND base_item=$2;', [category, item])
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                item_categories.push(query_res.rows[i]);
            }
            const data = {data: item_categories};
            res.render('customizes', data);
        });
});

app.get('/home', (req, res) => {
    const data = {name: "Micheal Scott"};
    res.render('home', data);
});

app.get('/order', (req, res) => {
    const data = {name: "Micheal Scott"};
    res.render('order', data);
});

app.get('/custom', (req, res) => {
    const data = {name: "Micheal Scott"};
    res.render('custom', data);
app.get('/manager', async (req, res) => {
    res.render('manager_main');
});
});

app.get('/manager', (req, res) => {
    res.render('manager_main');
});

app.get('/manager_employees', (req, res) => {
    employees = []
    pool
        .query('SELECT * FROM employees;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                employees.push(query_res.rows[i]);
            }
            const data = {employees: employees};
            console.log(employees);
            res.render('manager_employees', data);
        });
});

app.get('/manager_inventory', (req, res) => {
    supply = []
    pool
        .query('SELECT * FROM supply;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                supply.push(query_res.rows[i]);
            }
            const data = {supply: supply};
            console.log(supply);
            res.render('manager_inventory', data);
        });
});

app.get('/manager_reports', (req, res) => {
    orders = []
    pool
        .query('SELECT * FROM orders;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                orders.push(query_res.rows[i]);
            }
            const data = {orders: orders};
            console.log(orders);
            res.render('manager_reports', data);
        });
});

app.get('/managerItems', (req, res) => {
    items = []
    pool
        .query('SELECT * FROM items where default_item = true;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                items.push(query_res.rows[i]);
            }
            const data = {items: items};
            console.log(items);
            res.render('managerItems', data);
        });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.use(express.static('public'));
