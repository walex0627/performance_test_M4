//Import library of mysql and dotenv
import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

//To load .env variables
dotenv.config();

//Create connection
export const pool = mysql2.createPool({
    host : "localhost",
    database: "Performance_test_M4",
    user: "root",
    password: "walteralex0627",
    port: "3306",

})
//Try connection with database
// async function trialConnection(){
//     try{
//         const connection = await pool.getConnection();
//         console.log('connection sucessfull')
//         connection.release()
//     }catch(error){
//         console.error('connect error', error.message);
//     }
// }

// trialConnection()