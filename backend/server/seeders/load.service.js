/*responsible for loading users into the database*/
import fs from 'fs'; // this is what allows me to read files
import path from 'path'; // this shows the current path
import csv from 'csv-parser';
import { pool } from "../connections_db.js"


//To load clients
export async function loadClients() {

    const filePath = path.resolve('backend/server/data/01_clients.csv');
    const clients = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (rows) => {
                clients.push([
                    rows.client_id,
                    rows.name_client.trim(),
                    rows.identification,
                    rows.address,
                    rows.phone,
                    rows.email
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO clients (client_id,name_client,identification,address,phone,email) VALUES ?';
                    const [result] = await pool.query(sql, [clients]);

                    console.log(`✅ They were inserted ${result.affectedRows} clients.`);
                    resolve(); // Ends successfully
                } catch (error) {
                    console.error('❌ Error inserting users:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error reading user CSV file:', err.message);
                reject(err);
            });
    });
}

//To load transactions
export async function loadTransactions() {
    const filePath = path.resolve('backend/server/data/02_transaction.csv');
    const transactions = [];

    // CSV date conversion -> MySQL format
    function formatDateForMySQL(dateStr) {
        if (!dateStr || !dateStr.trim()) return null;
        const [day, month, rest] = dateStr.split('/');
        const [year, time] = rest.split(' ');
        return `${year}-${month}-${day} ${time}:00`;
    }

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (rows) => {
                transactions.push([
                    rows.transaction_code,
                    formatDateForMySQL(rows.transaction_datetime),
                    rows.transaction_amount, 
                    rows.transaction_status,
                    rows.transaction_type,
                    rows.platform_used,
                    rows.client_id_fk ? Number(rows.client_id_fk) : null
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = `
                        INSERT INTO transactions (
                            transaction_code,
                            transaction_datetime,
                            transaction_amount,
                            transaction_status,
                            transaction_type,
                            platform_used,
                            client_id_fk
                        ) VALUES ?`;

                    const [result] = await pool.query(sql, [transactions]);

                    console.log(`✅ They were inserted ${result.affectedRows} transactions.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error inserting transactions:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error reading transaction CSV file:', err.message);
                reject(err);
            });
    });
}


//To load bills
export async function loadBills() {
    const filePath = path.resolve('backend/server/data/03_bills.csv');
    const bills = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (rows) => {
                // Avoid rows without bill_code or blank
                if (!rows.bill_code || !rows.bill_code.trim()) {
                    console.warn("⚠️ Ignored row: empty bill_code");
                    return;
                }

                bills.push([
                    rows.bill_code.trim(),
                    rows.billing_period?.trim() || null,
                    rows.invoiced_amount ? Number(rows.invoiced_amount) : 0,
                    rows.paid_amount ? Number(rows.paid_amount) : 0,
                    rows.transaction_id_fk ? Number(rows.transaction_id_fk) : null,
                    rows.client_id_fk ? Number(rows.client_id_fk) : null
                ]);
            })
            .on('end', async () => {
                try {
                    if (bills.length === 0) {
                        console.warn("⚠️ No valid bills found to insert.");
                        resolve();
                        return;
                    }

                    const sql = `
                        INSERT INTO bills (
                            bill_code,
                            billing_period,
                            invoiced_amount,
                            paid_amount,
                            transaction_id_fk,
                            client_id_fk
                        ) VALUES ?`;

                    const [result] = await pool.query(sql, [bills]);

                    console.log(`✅ ${result.affectedRows} bills were inserted.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error inserting bills:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error reading bills CSV file:', err.message);
                reject(err);
            });
    });
}

