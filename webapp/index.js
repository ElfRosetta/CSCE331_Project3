const { name } = require('ejs');
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

// Create express app
const app = express();
const port = 3000;

const myModule = require('./public/functions').default;

app.use(express.json());
app.use(express.static('public'));

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
    res.redirect('/login');
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

app.get('/menu', async (req, res) => {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
    console.log(weather);
    pool
        .query('SELECT DISTINCT item_category FROM items;')
        .then(query_res => {
            const data = {item_categories: query_res.rows};
            res.render('menu', {data: data, weather: weather });
        });
});

app.get('/menu/:category', (req, res) => {
    const category = req.params.category;
    pool
        .query('SELECT DISTINCT base_item FROM items WHERE item_category=$1;', [category])
        .then(query_res => {
            const data = {
                base_items: query_res.rows,
                item_category: category
            };
            res.render('items', data);
        });
});

app.get('/menu/:category/:item', (req, res) => {
    const category = req.params.category;
    const item = req.params.item;

    const queries = [
        pool.query('SELECT * FROM items WHERE base_item=$1;', [item]),
        pool.query('SELECT DISTINCT syrup FROM items WHERE base_item=$1;', [item]),
        pool.query('SELECT DISTINCT liquid FROM items WHERE base_item=$1;', [item]),
        pool.query('SELECT DISTINCT milk FROM items WHERE base_item=$1;', [item]),
        pool.query('SELECT DISTINCT container FROM items WHERE base_item=$1;', [item]),
        pool.query('SELECT * FROM items WHERE base_item=$1 AND default_item=TRUE;', [item])
    ];
    Promise.all(queries)
        .then(query_res => {
            const data = {
                all: JSON.stringify(query_res[0].rows),
                syrups: query_res[1].rows,
                liquids:  query_res[2].rows,
                milks: query_res[3].rows,
                containers: query_res[4].rows,
                item_category: category,
                default_item: query_res[5].rows[0]
            };
            res.render('customizes', data);
        });
});

app.get('/home', (req, res) => {
    const data = {name: "Micheal Scott"};
    res.render('home', data);
});

app.get('/order', (req, res) => {
    const data = {pool: pool, 
        url : process.env.NODE_ENV === 'production' 
        ? 'https://csce331-project3-tgyx.onrender.com' 
        : 'http://localhost:3000'
    };
    res.render('order', data, );
});

app.get('/custom', (req, res) => {
    res.render('custom');
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
            const data = {employees: employees, 
                url : process.env.NODE_ENV === 'production' 
                ? 'https://csce331-project3-tgyx.onrender.com/editEmp2' 
                : 'http://localhost:3000/editEmp2'
            };
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
    const data = allPastOrders();
    res.json(data);
    res.render('manager_reports', data);
});

app.get('/managerItems', (req, res) => {
    items = []
    pool
        .query('SELECT * FROM items where default_item = true;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                items.push(query_res.rows[i]);
            }
            const data = {items: items,
                url : process.env.NODE_ENV === 'production' 
                ? 'https://csce331-project3-tgyx.onrender.com/editEmp2' 
                : 'http://localhost:3000/editEmp2'
            };
            console.log(items);
            res.render('managerItems', data);
        });
});

app.use(express.urlencoded({ extended: true })); // Add to handle form submissions

// Route to show the login page
app.get('/login', (req, res) => {
    res.render('login', { message: null }); // Render the login page
});

// Route to handle login form submission
app.post('/login', (req, res) => {
    const { id, password } = req.body;

    // Check the credentials (replace this with your own authentication logic)
    pool
        .query('SELECT * FROM employees WHERE id = $1 AND password = $2', [id, password])
        .then(query_res => {
            if (query_res.rowCount > 0) {
                // Login successful
                initiateGoogleLogin(req, res);
            } else {
                // Login failed
                res.render('login', { message: 'Invalid ID or password. Please try again.' });
            }
        })
        .catch(err => {
            console.error('Error checking credentials', err);
            res.render('login', { message: 'An error occurred. Please try again later.' });
        });
});

app.post('/addOrder', (req, res) => {
    //INSERT INTO orders VALUES ('1', '2024-05-19 08:56:08', '16', '26.0', '{148, 94, 100, 66, 27, 63}');
    if (Object.keys(req.body).length === 0) {
        return res.status(200).send(`good`);
    }
    
    const query = 'INSERT INTO orders VALUES ($1, $2, $3, $4, $5);';
    const orderId = req.body.orderId;//req.body.orderId;
    const timeStamp = new Date(req.body.timeStamp- (5 * 60 * 60 * 1000)).toISOString();//todo time zone
    const employeeId = req.body.employeeid; 
    const cost = req.body.cost;
    const ara = req.body.ara;
    
    pool.query(query, [orderId, timeStamp, employeeId, cost, ara], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error inserting data');
        }
        res.status(200).send(`good`);
    });
});

app.get('/maxOrderID', (req, res) => {
    const query = 'SELECT MAX(order_id) AS maxOrderId FROM orders;';
    
    pool.query(query, [], (err, results) => {
        if (err) {
            console.error('Error retrieving max order ID:', err);
            return res.status(500).send('Error retrieving max order ID');
        }
        
        // Extract the max order ID from the result
        const maxOrderId = results.rows[0].maxorderid || '-1';
        
        // Send the max order ID as a string
        res.status(200).send(`${maxOrderId}`);
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.use(express.static('public'));

// Add Employee Button
app.use(express.urlencoded({ extended: true })); // required for form data
app.use(express.json()); // also good for API usage

app.post('/add-employee', async (req, res) => {
  const { name, id, password, access } = req.body;

  try {
    await pool.query(
      'INSERT INTO employees (id, name, password, access) VALUES ($1, $2, $3, $4)',
      [id, name, password, access]
    );
    res.redirect('/manager_employees');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding employee');
  }
});

app.post('/delete-employee', async (req, res) => {
    const { id } = req.body;
  
    try {
      await pool.query(
        'DELETE FROM employees where id = $1',
        [id]
      );
      res.redirect('/manager_employees');
    } 
    catch (err) {
      console.error(err);
      res.status(500).send('Error deleting employee');
    }
});

  app.post('/add-item', async (req, res) => {
    const { itemID, itemName, customName, itemPrice, itemMilk, customMilk, itemSyrup, customSyrup, itemLiquid, customLiquid, itemContainer, itemDefault, itemCategory } = req.body;
  
    // If "Other" is selected for milk, use customMilk, otherwise use itemMilk
    const milk = itemMilk === 'Other' && customMilk ? customMilk : itemMilk;
    const syrup = itemSyrup === 'Other' && customSyrup ? customSyrup : itemSyrup;
    const liquid = itemLiquid === 'Other' && customLiquid ? customLiquid : itemLiquid;
    const name = itemName === 'Other' && customName ? customName : itemName;
  
    try {
      await pool.query(
        'INSERT INTO items (item_id, base_item, price, milk, syrup, liquid, container, default_item, item_category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [itemID, name, itemPrice, milk, syrup, liquid, itemContainer, itemDefault, itemCategory]
      );
      res.redirect('/managerItems');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding item');
    }
  });
  
  app.post('/delete-item', async (req, res) => {
    const { itemID } = req.body;
  
    try {
      await pool.query(
        'DELETE FROM items where item_id = $1',
        [itemID]
      );
      res.redirect('/managerItems');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting item');
    }
  });

const CLIENT_ID = '18223350022-172s797reo9v1nckkgp186atkj5t0hem.apps.googleusercontent.com';
const SCOPE = 'email profile';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://csce331-project3-tgyx.onrender.com' 
  : 'http://localhost:3000';

const REDIRECT_URI = `${BASE_URL}/login`;

function initiateGoogleLogin(req, res) {
    // Construct the OAuth 2.0 authorization URL
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        '&response_type=token' +
        `&scope=${encodeURIComponent(SCOPE)}` +
        '&prompt=login';

    // Redirect the user to Google's authorization page
    res.redirect(authUrl);
}

app.post('/editEmp2', (req, res) => {
    const EditEmployeeID = req.body.EditEmployeeID; 
    const valueUpdate = req.body.valueUpdate;
    const updateEmployee = req.body.updateEmployee;
    const query = `UPDATE employees SET ${updateEmployee} = $1 WHERE id = $2;`;
    
    pool.query(query, [valueUpdate,EditEmployeeID], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error inserting data');
        }
        res.status(200).send(`good`);
    });
});

// In routes/index.js or app.js
app.get('/weather', async (req, res) => {
    console.log("hi");
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
    console.log(weather);
    res.render('weatherTest.ejs', { weather: weather });
});
  //e0c211aa39e84f1df9238f13f4657409

  app.post('/editItem', (req, res) => {
    const EditEmployeeID = req.body.EditItemID; 
    const valueUpdate = req.body.valueUpdate;
    const updateEmployee = req.body.updateItem;
    const query = `UPDATE items SET ${updateEmployee} = $1 WHERE id = $2;`;
    
    pool.query(query, [valueUpdate,EditEmployeeID], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error inserting data');
        }
        res.status(200).send(`good`);
    });
});