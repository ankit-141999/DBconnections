const http = require('http');
const express = require('express');
const mysql = require('mysql');
const { MongoClient } = require('mongodb');

const app = express();

const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'ankit@141999',   //do change credentials for your own database
    database: 'dBconnections',
};

const mysqlConnection = mysql.createConnection(mysqlConfig);

    mysqlConnection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            return;
        }
        console.log('Connected to MySQL database');
        
       
        mysqlConnection.query(`CREATE DATABASE IF NOT EXISTS ${mysqlConfig.database}`, (err, result) => {
            if (err) {
                console.error('Error creating database:', err);
                return;
            }
            console.log('Database created or already exists');
            mysqlConnection.changeUser({ database: mysqlConfig.database }, (err) => {
                if (err) {
                    console.error('Error reconnecting to the database:', err);
                    return;
                }
                console.log(`Connected to database: ${mysqlConfig.database}`);
            });
        });
    });

    const mongoConfig = {
        host: '127.0.0.1',
        port: '27017',
        database: 'dBconnections',
    };
    
    let mongoClient;
    
    MongoClient.connect(`mongodb://${mongoConfig.host}:${mongoConfig.port}`, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            mongoClient = client;
            const db = client.db(mongoConfig.database);
            console.log('Connected to MongoDB database');
    
            
            db.createCollection('employees', (err, result) => {
                if (err) {
                    console.error('Error creating collection:', err);
                    return;
                }
                console.log('Collection created or already exists');
            });
        })
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
        });
    
    app.use(express.json());
    
    app.post('/employees1', (req, res) => {
        const { name, age, department, role } = req.body;
        const db = mongoClient.db(mongoConfig.database);
        const collection = db.collection('employees');
        collection.insertOne({ name, age, department, role })
            .then(result => {
                console.log('Record inserted into employees collection successfully');
                res.status(201).json({ message: 'Record inserted successfully' });
            })
            .catch(err => {
                console.error('Error inserting record into employees collection:', err);
                res.status(500).json({ error: 'Internal server error' });
            });
    });
    
    app.get('/employees/search1', (req, res) => {
        const { role } = req.query;
        const db = mongoClient.db(mongoConfig.database);
        const collection = db.collection('employees');
        collection.find({ role }).toArray()
            .then(results => {
                res.json(results);
            })
            .catch(err => {
                console.error('Error searching employees by role:', err);
                res.status(500).json({ error: 'Internal server error' });
            });
    });    

app.use(express.json());

app.post('/employees', (req, res) => {
    const { name, age, department, role } = req.body;
    const insertQuery = `INSERT INTO employee (name, age, department, role) VALUES (?, ?, ?, ?)`;
    mysqlConnection.query(insertQuery, [name, age, department, role], (err, results) => {
        if (err) {
            console.error('Error inserting record into employee table:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        console.log('Record inserted into employee table successfully');
        res.status(201).json({ message: 'Record inserted successfully' });
    });
});

app.get('/employees/search', (req, res) => {
    const { role } = req.query;
    const searchQuery = `SELECT * FROM employee WHERE role = ?`;
    mysqlConnection.query(searchQuery, [role], (err, results) => {
        if (err) {
            console.error('Error searching employees by role:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



