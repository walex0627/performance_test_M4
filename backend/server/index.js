// Import the library
import cors from 'cors'
import express from "express";
// Import the connection variable
import { pool } from './connections_db.js';

const app = express();

// Allow the backend app to be consumed by an API
app.use(cors())
// Allows Express to automatically parse JSON body on POST or PUT requests
app.use(express.json())

const PORT = "3000"
const api_version = "/api/v1"

app.get(`${api_version}`, async (req, res) => {
    res.send("server online");
});

// GET all clients
app.get(`${api_version}/clients`, async (req, res) => {
    try {
        const query = `SELECT client_id, name_client FROM clients`;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: error.message });
    }
});
// GET all transactions
app.get(`${api_version}/transactions`, async (req, res) => {
    try {
        const query = `
            SELECT 
                t.transaction_id,
                c.name_client,
                t.transaction_code,
                t.transaction_datetime,
                t.transaction_amount,
                t.transaction_status
            FROM transactions t
            LEFT JOIN clients c ON t.client_id_fk = c.client_id
            ORDER BY t.transaction_id;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET transaction by id
app.get(`${api_version}/transactions/:transaction_id`, async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const query = `SELECT * FROM transactions WHERE transaction_id = ?`;
        const [rows] = await pool.query(query, [transaction_id]);

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: "Transaction not found" });
        }
    } catch (error) {
        console.error("Error in GET by ID:", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// POST create new transaction
app.post(`${api_version}/transactions`, async (req, res) => {
    try {
        const {
            transaction_code,
            transaction_datetime,
            transaction_amount,
            transaction_status,
            transaction_type,
            platform_used,
            client_id_fk
        } = req.body;

        if (!client_id_fk || !transaction_code || !transaction_amount || !transaction_status || !transaction_type || !platform_used) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Format dat for MySql
        const formattedDatetime = new Date(transaction_datetime).toISOString().slice(0, 19).replace('T', ' ');

        const query = `
            INSERT INTO transactions (
                transaction_code,
                transaction_datetime,
                transaction_amount,
                transaction_status,
                transaction_type,
                platform_used,
                client_id_fk
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;


        const [result] = await pool.query(query, [
            transaction_code,
            formattedDatetime, 
            transaction_amount,
            transaction_status,
            transaction_type,
            platform_used,
            client_id_fk
        ]);

        res.status(201).json({
            message: "Transaction created successfully",
            transaction_id: result.insertId
        });

    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: "An internal server error occurred"
        });
    }
});
// PUT update transaction
app.put(`${api_version}/transactions/:transaction_id`, async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const {
            transaction_code,
            transaction_datetime,
            transaction_amount,
            transaction_status,
            transaction_type,
            platform_used,
            client_id_fk
        } = req.body;

        const query = `
            UPDATE transactions SET
                transaction_code = ?,
                transaction_datetime = ?,
                transaction_amount = ?,
                transaction_status = ?,
                transaction_type = ?,
                platform_used = ?,
                client_id_fk = ?
            WHERE transaction_id = ?
        `;

        const values = [
            transaction_code,
            transaction_datetime,
            transaction_amount,
            transaction_status,
            transaction_type,
            platform_used,
            client_id_fk,
            transaction_id
        ];

        const [result] = await pool.query(query, values);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Transaction updated" });
        } else {
            res.status(404).json({ message: "Transaction not found" });
        }
    } catch (error) {
        console.log("There is a problem", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// DELETE transaction
app.delete(`${api_version}/transactions/:transaction_id`, async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const query = `DELETE FROM transactions WHERE transaction_id = ?`;
        const [result] = await pool.query(query, [transaction_id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Transaction deleted" });
        } else {
            res.status(404).json({ message: "Transaction not found" });
        }
    } catch (error) {
        console.error("Error in DELETE:", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// GET transactions by client name
app.get(`${api_version}/transactions/client/:name_client`, async (req, res) => {
    try {
        const { name_client } = req.params;

        const query = `
            SELECT  
                transactions.transaction_id,
                transactions.transaction_code,
                transactions.transaction_datetime,
                transactions.transaction_amount,
                transactions.transaction_status,
                transactions.transaction_type,
                transactions.platform_used,
                clients.client_id,
                clients.name_client,
                clients.identification,
                clients.email,
                clients.phone,
                clients.address
            FROM transactions
            JOIN clients 
                ON clients.client_id = transactions.client_id_fk
            WHERE clients.name_client LIKE ?;
        `;

        const [rows] = await pool.query(query, [`%${name_client}%`]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No transactions found for this client" });
        }

        return res.json(rows);
    } catch (error) {
        console.log("There is a problem", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// GET total paid by clients
app.get(`${api_version}/clients/total-paid`, async (req, res) => {
    try {
        const query = `
            SELECT
                c.client_id,
                c.name_client,
                c.identification,
                c.email,
                SUM(t.transaction_amount) AS total_paid
            FROM clients AS c
            JOIN transactions AS t
                ON c.client_id = t.client_id_fk
            WHERE t.transaction_status = 'Completed'
            GROUP BY
                c.client_id,
                c.name_client,
                c.identification,
                c.email
            ORDER BY total_paid DESC;
        `;

        const [rows] = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No completed transactions found for any client."
            });
        }

        return res.json(rows);
    } catch (error) {
        console.error("Error getting total paid by client:", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// GET transactions by specific platform
app.get(`${api_version}/transactions/platform/:platform_used`, async (req, res) => {
    try {
        const { platform_used } = req.params;

        const query = `
            SELECT
                t.transaction_id,
                t.transaction_code,
                t.transaction_datetime,
                t.transaction_amount,
                t.transaction_status,
                t.transaction_type,
                t.platform_used,
                c.name_client,
                c.identification,
                c.email,
                b.bill_code,
                b.invoiced_amount,
                b.paid_amount
            FROM transactions AS t
            JOIN clients AS c
                ON c.client_id = t.client_id_fk
            LEFT JOIN bills AS b
                ON b.transaction_id_fk = t.transaction_id
            WHERE t.platform_used = ?
            ORDER BY t.transaction_datetime DESC;
        `;

        const [rows] = await pool.query(query, [platform_used]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: `No transactions found for platform: ${platform_used}.`
            });
        }

        return res.json(rows);
    } catch (error) {
        console.error("Error getting transactions by platform:", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

// GET pending bills
app.get(`${api_version}/bills/pending`, async (req, res) => {
    try {
        const query = `
            SELECT
                b.bill_id,
                b.bill_code,
                b.billing_period,
                b.invoiced_amount,
                b.paid_amount,
                (b.invoiced_amount - b.paid_amount) AS pending_amount,
                c.name_client,
                c.identification,
                c.email,
                t.transaction_code,
                t.transaction_datetime,
                t.transaction_amount
            FROM bills AS b
            JOIN clients AS c
                ON c.client_id = b.client_id_fk
            LEFT JOIN transactions AS t
                ON t.transaction_id = b.transaction_id_fk
            WHERE b.invoiced_amount > b.paid_amount
            ORDER BY b.billing_period DESC, c.name_client ASC;
        `;

        const [rows] = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No pending bills found."
            });
        }

        return res.json(rows);
    } catch (error) {
        console.error("Error getting pending bills:", error.message);
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${api_version}`);
});
