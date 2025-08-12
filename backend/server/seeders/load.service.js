/*se encarga de cargar los usuarios a la base de datos*/
import fs from 'fs'; // es la que me permite leer archivos
import path from 'path'; // esta muestra la ruta actual
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
                    resolve(); // Termina exitosamente
                } catch (error) {
                    console.error('❌ Error al insertar usuarios:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error al leer el archivo CSV de usuarios:', err.message);
                reject(err);
            });
    });
}

//To load transactions
export async function loadTransactions() {
    const filePath = path.resolve('backend/server/data/02_transaction.csv');
    const transactions = [];

    // Conversión de fecha CSV -> formato MySQL
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
                    rows.transaction_amount ? Number(rows.transaction_amount) : 0, // monto plano
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

                    console.log(`✅ Se insertaron ${result.affectedRows} transacciones.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error al insertar transacciones:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error al leer el archivo CSV de transacciones:', err.message);
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
                // Evitar filas sin bill_code o en blanco
                if (!rows.bill_code || !rows.bill_code.trim()) {
                    console.warn("⚠️ Fila ignorada: bill_code vacío");
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
                        console.warn("⚠️ No se encontraron facturas válidas para insertar.");
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

                    console.log(`✅ Se insertaron ${result.affectedRows} facturas.`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error al insertar facturas:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error al leer el archivo CSV de facturas:', err.message);
                reject(err);
            });
    });
}
