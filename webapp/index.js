const { name } = require('ejs');
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();
const schedule = require('node-schedule');

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
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Dallas,tx,us&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
    //console.log(weather);
    pool
        .query('SELECT DISTINCT item_category FROM items;')
        .then(query_res => {
            const data = {item_categories: query_res.rows};
            res.render('menu', {data: data, weather: weather,  
                url : process.env.NODE_ENV === 'production' 
                ? 'https://csce331-project3-tgyx.onrender.com' 
                : 'http://localhost:3000'
            });
        });
});

app.get('/menu/:category', async (req, res) => {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Dallas,tx,us&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
    const category = req.params.category;
    pool
        .query('SELECT DISTINCT base_item FROM items WHERE item_category=$1;', [category])
        .then(query_res => {
            const data = {
                base_items: query_res.rows,
                item_category: category,
                weather: weather
            };
            res.render('items', data);
        });
});

app.get('/menu/:category/:item', async (req, res) => {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Dallas,tx,us&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
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
                default_item: query_res[5].rows[0],
                weather: weather
            };
            res.render('customizes', data);
        });
});

app.get('/home', (req, res) => {
    const data = {name: "Micheal Scott"};
    res.render('home', data);
});

app.get('/order', async (req, res) => {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Dallas,tx,us&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
    const data = {pool: pool, 
        url : process.env.NODE_ENV === 'production' 
        ? 'https://csce331-project3-tgyx.onrender.com'
        : 'http://localhost:3000',
        weather: weather
    };
    res.render('order', data);
});

app.get('/custom', (req, res) => {
    const data = {pool: pool, 
        url : process.env.NODE_ENV === 'production' 
        ? 'https://csce331-project3-tgyx.onrender.com' 
        : 'http://localhost:3000'
    };
    res.render('custom', data, );
});

app.get('/manager', async (req, res) => {
    res.render('manager_main');
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
            const data = {supply: supply,url : process.env.NODE_ENV === 'production' 
                ? 'https://csce331-project3-tgyx.onrender.com' 
                : 'http://localhost:3000'
            };
            //console.log(supply);
            res.render('manager_inventory', data);
        });
});

app.get('/manager_reports', (req, res) => {
    const data = {pool: pool};
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
    res.render('login', { message: null,  
        url : process.env.NODE_ENV === 'production' 
        ? 'https://csce331-project3-tgyx.onrender.com' 
        : 'http://localhost:3000'
    }); // Render the login page
});

// Route to handle login form submission
app.post('/login', (req, res) => {
    const { id, password } = req.body;

    if (isNaN(parseInt(id)))
    {
        res.render('login', { message: 'Invalid ID or password. Please try again.',  
            url : process.env.NODE_ENV === 'production' 
            ? 'https://csce331-project3-tgyx.onrender.com' 
            : 'http://localhost:3000'
        });
    }
    else {
        // Check the credentials (replace this with your own authentication logic)
        pool
            .query('SELECT * FROM employees WHERE id = $1 AND password = $2', [id, password])
            .then(query_res => {
                if (query_res.rowCount > 0) {
                    // Login successful
                    if (parseInt(id) == -1)
                    {
                        res.redirect('/menu');
                    }
                    initiateGoogleLogin(req, res);
                } else {
                    // Login failed
                    res.render('login', { message: 'Invalid ID or password. Please try again.',  
                        url : process.env.NODE_ENV === 'production' 
                        ? 'https://csce331-project3-tgyx.onrender.com' 
                        : 'http://localhost:3000'
                    });
                }
            })
            .catch(err => {
                console.error('Error checking credentials', err);
                res.render('login', { message: 'An error occurred. Please try again later.',  
                    url : process.env.NODE_ENV === 'production' 
                    ? 'https://csce331-project3-tgyx.onrender.com' 
                    : 'http://localhost:3000'
                });
            });
    }
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

app.post('/justDo', (req, res) => {
    
    const query = req.body.input;
    
    pool.query(query, [], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error inserting data');
        }
        res.status(200).json(results);
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
  app.post('/add-inventory', async (req, res) => {
    const { currquant, filltoquant, targquant, name, category, customCategory, units, customUnits} = req.body;
  
    // If "Other" is selected for milk, use customMilk, otherwise use itemMilk
    const inventoryCategory = category === 'Other' && customCategory ? customCategory : category;
    const inventoryUnits = units === 'Other' && customUnits ? customUnits : units;
  
    try {
      await pool.query(
        'INSERT INTO supply (currquant, filltoquant, targquant, name, category, units) VALUES ($1, $2, $3, $4, $5, $6)',
        [currquant, filltoquant, targquant, name, inventoryCategory, inventoryUnits]
      );
      res.redirect('/manager_inventory');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding inventory item');
    }
  });

  app.post('/delete-inventory', async (req, res) => {
    const { name } = req.body;
  
    try {
      await pool.query(
        'DELETE FROM supply where name = $1',
        [name]
      );
      res.redirect('/manager_inventory');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting inventory');
    }
  });


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
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=77766848275fd9388353c9cd5e085968');
    const weather = await response.json();
    res.render('weatherTest.ejs', { weather: weather });
});
  //e0c211aa39e84f1df9238f13f4657409

  app.post('/itemReport', (req, res) => {

    const m45 = (req.body.sortBy);
    const m46 = (req.body.sortDir);

    const daBiggestBoi = `
                
                SELECT 
                                    
                item, 
                
                syrup, 
                
                milk, 
                
                ROUND(CAST(salesAct AS numeric),2) AS sales, 
                
                soldAct AS sold, 
                
                ROUND(CAST(salesPerHourAct AS numeric),2) AS salesPerHour, 
                
                ROUND(CAST(soldPerHourAct AS numeric),2) AS soldPerHour, 
                
                ROUND(CAST((salesAct - salesCom) AS numeric),2) AS salesDifference, 
                
                (soldAct - soldCom) AS soldDifference, 
                
                ROUND(CAST((salesPerHourAct - salesPerHourCom) AS numeric),2) AS salesPerHourDifference, 
                
                ROUND(CAST((soldPerHourAct - soldPerHourCom) AS numeric),2) AS soldPerHourDifference 
                
                FROM 
                
                ( 


                
                (SELECT 
                
                itema AS item, 
                
                syrupa AS syrup, 
                
                milka AS milk, 
                
                (COALESCE (sales, CAST(0.0 AS double precision) )) AS salesAct,  
                
                (COALESCE (sold, 0)) AS soldAct, 
                
                (((COALESCE (sales, CAST(0.0 AS double precision) )) *60)/$1) as salesPerHourAct, 
                
                ((CAST((COALESCE (sold, 0)) AS double precision)*60)/$2) as soldPerHourAct 
                
                FROM( 
                
                (SELECT  
                
                item, 
                
                (COALESCE(milk, CAST('none' AS character varying))) AS milk,
                
                (COALESCE(syrup, CAST('none' AS character varying))) AS syrup,
                
                SUM(sales) AS sales, 
                
                SUM(sold) AS sold 
                
                FROM 
                
                (SELECT  
                
                    EXTRACT(YEAR FROM order_timestamp) AS year, 
                
                EXTRACT(MONTH FROM order_timestamp) AS month_number, 
                
                    EXTRACT(DAY FROM order_timestamp) AS day_number, 
                
                EXTRACT(HOUR FROM order_timestamp) AS hour_number, 
                
                    EXTRACT(MINUTE FROM order_timestamp) AS minute_number, 
                
                    ITEMid, 
                
                    (SELECT base_item FROM ITEMS WHERE item_id = ITEMid) AS item, 
                
                (SELECT milk FROM ITEMS WHERE item_id = ITEMid) AS milk, 
                
                (SELECT syrup FROM ITEMS WHERE item_id = ITEMid) AS syrup, 
                
                    COUNT(PRICE)* (SELECT PRICE FROM ITEMS WHERE item_id = ITEMid) AS sales, 
                
                COUNT(PRICE) AS sold 
                
                    FROM orders, 
                
                    UNNEST(ITEMS) AS ITEMid 
                
                
                
                WHERE  
                
                ( 
                
                EXTRACT(YEAR FROM order_timestamp) BETWEEN $3+1 AND $4-1 
                
                OR 
                
                    ( 
                
                    EXTRACT(YEAR FROM order_timestamp) BETWEEN $5 AND $6
                
                    AND 
                
                        ( 
                
                        ( 
                
                        EXTRACT(YEAR FROM order_timestamp) <> $7
                
                            OR 
                
                            ( 
                
                EXTRACT(MONTH FROM order_timestamp) > $8
                
                                OR 
                
                                ( 
                
                                EXTRACT(MONTH FROM order_timestamp) = $9
                
                                AND 
                
                                ( 
                
                                EXTRACT(DAY FROM order_timestamp) >= $10
                
                                ) 
                
                                ) 
                
                            ) 
                
                        ) 
                
                        AND 
                
                        ( 
                
                        EXTRACT(YEAR FROM order_timestamp) <> $11
                
                            OR 
                
                            ( 
                
                            EXTRACT(MONTH FROM order_timestamp) < $12
                
                            OR 
                
                            ( 
                
                            EXTRACT(MONTH FROM order_timestamp) = $13
                
                                AND 
                
                                ( 
                
                                EXTRACT(DAY FROM order_timestamp) <= $14
                
                                ) 
                
                            ) 
                
                            ) 
                
                        ) 
                
                        ) 
                
                    )   
                
                ) 
                
                AND 
                
                ( 
                
                EXTRACT(HOUR FROM order_timestamp) BETWEEN $15+1 AND $16-1 
                
                    OR 
                
                    ( 
                
                    EXTRACT(HOUR FROM order_timestamp) BETWEEN $17 AND $18
                
                        AND 
                
                        ( 
                
                        ( 
                
                        EXTRACT(HOUR FROM order_timestamp) <> $19
                
                            OR 
                
                            ( 
                
                            EXTRACT(MINUTE FROM order_timestamp) >= $20
                
                            ) 
                
                        ) 
                
                        AND 
                
                        ( 
                
                        EXTRACT(HOUR FROM order_timestamp) <> $21
                
                            OR 
                
                            ( 
                
                            EXTRACT(MINUTE FROM order_timestamp) <= $22
                
                            ) 
                
                        ) 
                
                        ) 
                
                    ) 
                
                ) 
                
                
                
                    GROUP BY year, month_number, day_number,hour_number,minute_number,ITEMid 
                
                ) AS idSalesTime 
                
                    GROUP BY item, milk, syrup 
                
                ) AS baseSalesTime 
                
                RIGHT JOIN 
                
                (SELECT 
                
                base_item AS itema, 
                
                (COALESCE(syrup, CAST('none' AS character varying))) AS syrupa, 
                
                (COALESCE(milk, CAST('none' AS character varying))) AS milka 
                
                FROM  ITEMS 
                
                GROUP BY itema, syrupa, milka 
                
                ) AS itemALL 
                
                ON baseSalesTime.item=itemAll.itema 
                
                AND baseSalesTime.syrup=itemAll.syrupa 
                
                AND baseSalesTime.milk=itemAll.milka 
                
                ) 
                
                ) AS active 







                
                INNER JOIN 





                
                (SELECT 
                
                itema AS itemC, 
                
                syrupa AS syrupC, 
                
                milka AS milkC, 
                
                (COALESCE (sales, CAST(0.0 AS double precision) )) AS salesCom,  
                
                (COALESCE (sold, 0)) AS soldCom, 
                
                (((COALESCE (sales, CAST(0.0 AS double precision) )) *60)/$23) as salesPerHourCom, 
                
                ((CAST((COALESCE (sold, 0)) AS double precision)*60)/$24) as soldPerHourCom 
                
                FROM( 
                
                (SELECT  
                
                item, 
                
                (COALESCE(milk, CAST('none' AS character varying))) AS milk,
                
                (COALESCE(syrup, CAST('none' AS character varying))) AS syrup,
                
                SUM(sales) AS sales, 
                
                SUM(sold) AS sold 
                
                FROM 
                
                (SELECT  
                
                    EXTRACT(YEAR FROM order_timestamp) AS year, 
                
                EXTRACT(MONTH FROM order_timestamp) AS month_number, 
                
                    EXTRACT(DAY FROM order_timestamp) AS day_number, 
                
                EXTRACT(HOUR FROM order_timestamp) AS hour_number, 
                
                    EXTRACT(MINUTE FROM order_timestamp) AS minute_number, 
                
                    ITEMid, 
                
                    (SELECT base_item FROM ITEMS WHERE item_id = ITEMid) AS item, 
                
                (SELECT milk FROM ITEMS WHERE item_id = ITEMid) AS milk, 
                
                (SELECT syrup FROM ITEMS WHERE item_id = ITEMid) AS syrup, 
                
                    COUNT(PRICE)* (SELECT PRICE FROM ITEMS WHERE item_id = ITEMid) AS sales, 
                
                COUNT(PRICE) AS sold 
                
                    FROM orders, 
                
                    UNNEST(ITEMS) AS ITEMid 
                
                
                
                WHERE  
                
                ( 
                
                EXTRACT(YEAR FROM order_timestamp) BETWEEN $25+1 AND $26-1 
                
                OR 
                
                    ( 
                
                    EXTRACT(YEAR FROM order_timestamp) BETWEEN $27 AND $28
                
                    AND 
                
                        ( 
                
                        ( 
                
                        EXTRACT(YEAR FROM order_timestamp) <> $29
                
                            OR 
                
                            ( 
                
                EXTRACT(MONTH FROM order_timestamp) > $30
                
                                OR 
                
                                ( 
                
                                EXTRACT(MONTH FROM order_timestamp) = $31
                
                                AND 
                
                                ( 
                
                                EXTRACT(DAY FROM order_timestamp) >= $32
                
                                ) 
                
                                ) 
                
                            ) 
                
                        ) 
                
                        AND 
                
                        ( 
                
                        EXTRACT(YEAR FROM order_timestamp) <> $33
                
                            OR 
                
                            ( 
                
                            EXTRACT(MONTH FROM order_timestamp) < $34
                
                            OR 
                
                            ( 
                
                            EXTRACT(MONTH FROM order_timestamp) = $35
                
                                AND 
                
                                ( 
                
                                EXTRACT(DAY FROM order_timestamp) <= $36
                
                                ) 
                
                            ) 
                
                            ) 
                
                        ) 
                
                        ) 
                
                    )   
                
                ) 
                
                AND 
                
                ( 
                
                EXTRACT(HOUR FROM order_timestamp) BETWEEN $37+1 AND $38-1 
                
                    OR 
                
                    ( 
                
                    EXTRACT(HOUR FROM order_timestamp) BETWEEN $39 AND $40
                
                        AND 
                
                        ( 
                
                        ( 
                
                        EXTRACT(HOUR FROM order_timestamp) <> $41
                
                            OR 
                
                            ( 
                
                            EXTRACT(MINUTE FROM order_timestamp) >= $42
                
                            ) 
                
                        ) 
                
                        AND 
                
                        ( 
                
                        EXTRACT(HOUR FROM order_timestamp) <> $43
                
                            OR 
                
                            ( 
                
                            EXTRACT(MINUTE FROM order_timestamp) <= $44 
                
                            ) 
                
                        ) 
                
                        ) 
                
                    ) 
                
                ) 
                
                
                
                    GROUP BY year, month_number, day_number,hour_number,minute_number,ITEMid 
                
                ) AS idSalesTime 
                
                    GROUP BY item, milk, syrup 
                
                ) AS baseSalesTime 
                
                RIGHT JOIN 
                
                (SELECT 
                
                base_item AS itema, 
                
                (COALESCE(syrup, CAST('none' AS character varying))) AS syrupa, 
                
                (COALESCE(milk, CAST('none' AS character varying))) AS milka 
                
                FROM  ITEMS 
                
                GROUP BY itema, syrupa, milka 
                
                ) AS itemALL 
                
                ON baseSalesTime.item=itemAll.itema 
                
                AND baseSalesTime.syrup=itemAll.syrupa 
                
                AND baseSalesTime.milk=itemAll.milka 
                
                ) 
                
                ) AS compare 




                
                
                ON active.item=compare.itemC 
                
                AND active.syrup=compare.syrupC 
                
                AND active.milk=compare.milkC 
                
                )

                ORDER BY ${m45} ${m46}

                ;
                `;

    const m1 = parseInt(req.body.minActiveDur);
    const m2 = parseInt(req.body.minActiveDur);
    const m3 = parseInt(req.body.startActiveYear);
    const m4 = parseInt(req.body.endActiveYear);
    const m5 = parseInt(req.body.startActiveYear);
    const m6 = parseInt(req.body.endActiveYear);
    const m7 = parseInt(req.body.startActiveYear);
    const m8 = parseInt(req.body.startActiveMonth);
    const m9 = parseInt(req.body.startActiveMonth);
    const m10 = parseInt(req.body.startActiveDay);
    const m11 = parseInt(req.body.endActiveYear);
    const m12 = parseInt(req.body.endActiveMonth);
    const m13 = parseInt(req.body.endActiveMonth);
    const m14 = parseInt(req.body.endActiveDay);
    const m15 = parseInt(req.body.startActiveHour);
    const m16 = parseInt(req.body.endActiveHour);
    const m17 = parseInt(req.body.startActiveHour);
    const m18 = parseInt(req.body.endActiveHour);
    const m19 = parseInt(req.body.startActiveHour);
    const m20 = parseInt(req.body.startActiveMinute);
    const m21 = parseInt(req.body.endActiveHour);
    const m22 = parseInt(req.body.endActiveMinute);
    const m23 = parseInt(req.body.minCompareDur);
    const m24 = parseInt(req.body.minCompareDur);
    const m25 = parseInt(req.body.startCompareYear);
    const m26 = parseInt(req.body.endCompareYear);
    const m27 = parseInt(req.body.startCompareYear);
    const m28 = parseInt(req.body.endCompareYear);
    const m29 = parseInt(req.body.startCompareYear);
    const m30 = parseInt(req.body.startCompareMonth);
    const m31 = parseInt(req.body.startCompareMonth);
    const m32 = parseInt(req.body.startCompareDay);
    const m33 = parseInt(req.body.endCompareYear);
    const m34 = parseInt(req.body.endCompareMonth);
    const m35 = parseInt(req.body.endCompareMonth);
    const m36 = parseInt(req.body.endCompareDay);
    const m37 = parseInt(req.body.startCompareHour);
    const m38 = parseInt(req.body.endCompareHour);
    const m39 = parseInt(req.body.startCompareHour);
    const m40 = parseInt(req.body.endCompareHour);
    const m41 = parseInt(req.body.startCompareHour);
    const m42 = parseInt(req.body.startCompareMinute);
    const m43 = parseInt(req.body.endCompareHour);
    const m44 = parseInt(req.body.endCompareMinute);

    
    
    pool.query(daBiggestBoi, [m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15,m16,m17,m18,m19,m20,m21,m22,m23,m24,m25,m26,m27,m28,m29,m30,m31,m32,m33,m34,m35,m36,m37,m38,m39,m40,m41,m42,m43,m44], (err, results) => {
        if (err) {
            console.error('Error retrieving report:', err);
            return res.status(500).send('Error retrieving report');
        }
        
        // Extract the max order ID from the result
        
        // Send the results
        res.status(200).json(results);
    });
});

app.post('/empReport', (req, res) => {

    const m45 = (req.body.sortBy);
    const m46 = (req.body.sortDir);

     daBiggestBoi = `
                
                Select

                id,

                name,

                ROUND(CAST(salesAct AS numeric),2) AS sales, 
                            
                soldAct AS sold, 
                            
                ROUND(CAST(salesPerHourAct AS numeric),2) AS salesPerHour, 
                            
                ROUND(CAST(soldPerHourAct AS numeric),2) AS soldPerHour, 
                            
                ROUND(CAST((salesAct - salesComp) AS numeric),2) AS salesDifference, 
                            
                (soldAct - soldComp) AS soldDifference, 
                            
                ROUND(CAST((salesPerHourAct - salesPerHourComp) AS numeric),2) AS salesPerHourDifference, 
                            
                ROUND(CAST((soldPerHourAct - soldPerHourComp) AS numeric),2) AS soldPerHourDifference 

                FROM
                (
                    (
                        SELECT

                        idb AS id,
                        (SELECT name FROM EMPLOYEES WHERE id=idb) AS name,
                        (COALESCE (sales, CAST(0.0 AS double precision) )) AS salesAct,
                        (COALESCE (sold, CAST(0.0 AS double precision) )) AS soldAct,
                        (((COALESCE (sales, CAST(0.0 AS double precision) ))*60)/$1) AS salesPerHourAct,
                        (((COALESCE (sold, CAST(0.0 AS double precision) ))*60)/$2) AS soldPerHourAct

                        FROM
                        (
                            SELECT
                        
                            employee_id AS ide,
                            SUM(price) AS sales,
                            COUNT(price) AS sold

                            FROM

                            ORDERS

                            WHERE  
                            
                            ( 
                            
                            EXTRACT(YEAR FROM order_timestamp) BETWEEN $3+1 AND $4-1 
                            
                            OR 
                            
                                ( 
                            
                                EXTRACT(YEAR FROM order_timestamp) BETWEEN $5 AND $6
                            
                                AND 
                            
                                    ( 
                            
                                    ( 
                            
                                    EXTRACT(YEAR FROM order_timestamp) <> $7
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MONTH FROM order_timestamp) > $8
                            
                                            OR 
                            
                                            ( 
                            
                                            EXTRACT(MONTH FROM order_timestamp) = $9
                            
                                            AND 
                            
                                            ( 
                            
                                            EXTRACT(DAY FROM order_timestamp) >= $10
                            
                                            ) 
                            
                                            ) 
                            
                                        ) 
                            
                                    ) 
                            
                                    AND 
                            
                                    ( 
                            
                                    EXTRACT(YEAR FROM order_timestamp) <> $11
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MONTH FROM order_timestamp) < $12
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MONTH FROM order_timestamp) = $13
                            
                                            AND 
                            
                                            ( 
                            
                                            EXTRACT(DAY FROM order_timestamp) <= $14
                            
                                            ) 
                            
                                        ) 
                            
                                        ) 
                            
                                    ) 
                            
                                    ) 
                            
                                )   
                            
                            ) 
                            
                            AND 
                            
                            ( 
                            
                            EXTRACT(HOUR FROM order_timestamp) BETWEEN $15+1 AND $16-1 
                            
                                OR 
                            
                                ( 
                            
                                EXTRACT(HOUR FROM order_timestamp) BETWEEN $17 AND $18
                            
                                    AND 
                            
                                    ( 
                            
                                    ( 
                            
                                    EXTRACT(HOUR FROM order_timestamp) <> $19
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MINUTE FROM order_timestamp) >= $20
                            
                                        ) 
                            
                                    ) 
                            
                                    AND 
                            
                                    ( 
                            
                                    EXTRACT(HOUR FROM order_timestamp) <> $21
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MINUTE FROM order_timestamp) <= $22
                            
                                        ) 
                            
                                    ) 
                            
                                    ) 
                            
                                ) 
                            
                            ) 
                            
                            
                            
                            GROUP BY employee_id
                        ) AS baseEMP
                        RIGHT JOIN
                        (
                            SELECT

                            id AS idb,
                            name

                            FROM
                            
                            EMPLOYEES

                        ) AS allEMP
                        ON baseEMP.ide=allEMP.idb
                            

                    ) AS active
                    INNER JOIN
                    (
                        SELECT
                        
                        idb AS idC,
                        (SELECT name FROM EMPLOYEES WHERE id=idb) AS nameC,
                        (COALESCE (sales, CAST(0.0 AS double precision) )) AS salesComp,
                        (COALESCE (sold, CAST(0.0 AS double precision) )) AS soldComp,
                        (((COALESCE (sales, CAST(0.0 AS double precision) ))*60)/$23) AS salesPerHourComp,
                        (((COALESCE (sold, CAST(0.0 AS double precision) ))*60)/$24) AS soldPerHourComp

                        FROM
                        (
                            SELECT
                        
                            employee_id AS ide,
                            SUM(price) AS sales,
                            COUNT(price) AS sold

                            FROM

                            ORDERS

                            WHERE  
                            
                            ( 
                            
                            EXTRACT(YEAR FROM order_timestamp) BETWEEN $25+1 AND $26-1 
                            
                            OR 
                            
                                ( 
                            
                                EXTRACT(YEAR FROM order_timestamp) BETWEEN $27 AND $28
                            
                                AND 
                            
                                    ( 
                            
                                    ( 
                            
                                    EXTRACT(YEAR FROM order_timestamp) <> $29
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MONTH FROM order_timestamp) > $30
                            
                                            OR 
                            
                                            ( 
                            
                                            EXTRACT(MONTH FROM order_timestamp) = $31
                            
                                            AND 
                            
                                            ( 
                            
                                            EXTRACT(DAY FROM order_timestamp) >= $32
                            
                                            ) 
                            
                                            ) 
                            
                                        ) 
                            
                                    ) 
                            
                                    AND 
                            
                                    ( 
                            
                                    EXTRACT(YEAR FROM order_timestamp) <> $33
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MONTH FROM order_timestamp) < $34
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MONTH FROM order_timestamp) = $35
                            
                                            AND 
                            
                                            ( 
                            
                                            EXTRACT(DAY FROM order_timestamp) <= $36
                            
                                            ) 
                            
                                        ) 
                            
                                        ) 
                            
                                    ) 
                            
                                    ) 
                            
                                )   
                            
                            ) 
                            
                            AND 
                            
                            ( 
                            
                            EXTRACT(HOUR FROM order_timestamp) BETWEEN $37+1 AND $38-1 
                            
                                OR 
                            
                                ( 
                            
                                EXTRACT(HOUR FROM order_timestamp) BETWEEN $39 AND $40
                            
                                    AND 
                            
                                    ( 
                            
                                    ( 
                            
                                    EXTRACT(HOUR FROM order_timestamp) <> $41
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MINUTE FROM order_timestamp) >= $42
                            
                                        ) 
                            
                                    ) 
                            
                                    AND 
                            
                                    ( 
                            
                                    EXTRACT(HOUR FROM order_timestamp) <> $43
                            
                                        OR 
                            
                                        ( 
                            
                                        EXTRACT(MINUTE FROM order_timestamp) <= $44
                            
                                        ) 
                            
                                    ) 
                            
                                    ) 
                            
                                ) 
                            
                            ) 
                            
                            
                            
                            GROUP BY employee_id


                        ) AS baseEMP
                        RIGHT JOIN
                        (
                            SELECT

                            id AS idb,
                            name

                            FROM
                            
                            EMPLOYEES

                        ) AS allEMP
                        ON baseEMP.ide=allEMP.idb 
                            

                    ) AS compare

                    ON active.id=compare.idC 
                            
                    AND active.name=compare.nameC 
                    )
                    ORDER BY ${m45} ${m46}
                ;
                `;

    const m1 = parseInt(req.body.minActiveDur);
    const m2 = parseInt(req.body.minActiveDur);
    const m3 = parseInt(req.body.startActiveYear);
    const m4 = parseInt(req.body.endActiveYear);
    const m5 = parseInt(req.body.startActiveYear);
    const m6 = parseInt(req.body.endActiveYear);
    const m7 = parseInt(req.body.startActiveYear);
    const m8 = parseInt(req.body.startActiveMonth);
    const m9 = parseInt(req.body.startActiveMonth);
    const m10 = parseInt(req.body.startActiveDay);
    const m11 = parseInt(req.body.endActiveYear);
    const m12 = parseInt(req.body.endActiveMonth);
    const m13 = parseInt(req.body.endActiveMonth);
    const m14 = parseInt(req.body.endActiveDay);
    const m15 = parseInt(req.body.startActiveHour);
    const m16 = parseInt(req.body.endActiveHour);
    const m17 = parseInt(req.body.startActiveHour);
    const m18 = parseInt(req.body.endActiveHour);
    const m19 = parseInt(req.body.startActiveHour);
    const m20 = parseInt(req.body.startActiveMinute);
    const m21 = parseInt(req.body.endActiveHour);
    const m22 = parseInt(req.body.endActiveMinute);
    const m23 = parseInt(req.body.minCompareDur);
    const m24 = parseInt(req.body.minCompareDur);
    const m25 = parseInt(req.body.startCompareYear);
    const m26 = parseInt(req.body.endCompareYear);
    const m27 = parseInt(req.body.startCompareYear);
    const m28 = parseInt(req.body.endCompareYear);
    const m29 = parseInt(req.body.startCompareYear);
    const m30 = parseInt(req.body.startCompareMonth);
    const m31 = parseInt(req.body.startCompareMonth);
    const m32 = parseInt(req.body.startCompareDay);
    const m33 = parseInt(req.body.endCompareYear);
    const m34 = parseInt(req.body.endCompareMonth);
    const m35 = parseInt(req.body.endCompareMonth);
    const m36 = parseInt(req.body.endCompareDay);
    const m37 = parseInt(req.body.startCompareHour);
    const m38 = parseInt(req.body.endCompareHour);
    const m39 = parseInt(req.body.startCompareHour);
    const m40 = parseInt(req.body.endCompareHour);
    const m41 = parseInt(req.body.startCompareHour);
    const m42 = parseInt(req.body.startCompareMinute);
    const m43 = parseInt(req.body.endCompareHour);
    const m44 = parseInt(req.body.endCompareMinute);

    
    
    pool.query(daBiggestBoi, [m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15,m16,m17,m18,m19,m20,m21,m22,m23,m24,m25,m26,m27,m28,m29,m30,m31,m32,m33,m34,m35,m36,m37,m38,m39,m40,m41,m42,m43,m44], (err, results) => {
        if (err) {
            console.error('Error retrieving report:', err);
            return res.status(500).send('Error retrieving report');
        }
        
        // Extract the max order ID from the result
        
        // Send the results
        res.status(200).json(results);
    });
});


async function justDoIt(input,new_url){

    const response = await fetch(new_url + '/justDo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      alert('Error doing sql');
      return null;
    }

}

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://csce331-project3-tgyx.onrender.com'
  : 'http://localhost:3000';

async function decreasePrices() {
    for (const cata of ['Coffees']) {
        const tempQ = `UPDATE items SET price=price-1 WHERE item_category = '${cata}';`;
        await justDoIt(tempQ, baseURL);
    }
}

async function increasePrices() {
    for (const cata of ['Coffees'])
    {
        const tempQ = `UPDATE items SET price=price+1 WHERE item_category = '${cata}';`;
        await justDoIt(tempQ, baseURL);
    }
}

const job1 = schedule.scheduleJob('00 10 * * *', decreasePrices);
const job2 = schedule.scheduleJob('00 06 * * *', increasePrices);