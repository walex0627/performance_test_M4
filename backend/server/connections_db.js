//Import library of mysql and dotenv
import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';


//Create connection
export const pool = mysql2.createPool({
    host : "localhost",
    database: "Expertsoft",
    user: "root",
    password: "NuevaContraseña",
    port: "3306",
})

//Probando la conexion con la base de datos
async function probarConexion(){
    try{
        const connection = await pool.getConnection();
        console.log('conexion exitosa')
        connection.release()
    }catch(error){
        console.error('error al conectar', error.message);
    }
}

probarConexion()