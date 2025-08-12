# Financial Data Management System for Fintech Transactions

## 📌 Description
This project was developed for **ExpertSoft**, a Colombian software company specialized in solutions for the electrical sector.  
The client faced difficulties managing financial information from Fintech platforms such as **Nequi** and **Daviplata**, as the data was scattered across multiple disorganized Excel files (.xlsx).  

The implemented solution organizes, structures, and stores this information in a **SQL relational database**, enabling **bulk data loading**, complete **CRUD operations**, and **advanced queries** to meet business requirements.  
A minimal **frontend dashboard** allows basic management of one of the database entities.

---

## 🎯 Objective
The goal of this project is to:
- Normalize the provided financial data using **1NF, 2NF, and 3NF**.
- Design a **relational model** representing the normalized data structure.
- Implement the database schema and **bulk load** data from CSV files.
- Create a **CRUD system** (Create, Read, Update, Delete) for one entity.
- Develop **advanced SQL queries** to fulfill specific business needs.
- Provide a **frontend dashboard** for entity management.

---

## 🛠️ Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MySQL / MariaDB
- **Frontend**: HTML, CSS, Tailwind CSS / Bootstrap
- **Tools**: Draw.io (ER model), Postman, MySQL Workbench
- **File Formats**: .xlsx (source), .csv (for bulk load)
- **Other**: JavaScript ES6, REST API

---

## 📂 Project Structure

---

## 📊 Database Normalization
The original Excel file was disorganized and contained redundant, unstructured information.  
The normalization process was done **manually** as follows:

1. **First Normal Form (1NF)**  
   - Removed duplicate rows.
   - Ensured each cell contains a single value.
   - Assigned primary keys to each table.

2. **Second Normal Form (2NF)**  
   - Removed partial dependencies.
   - Separated data into different tables according to their functional dependency.

3. **Third Normal Form (3NF)**  
   - Removed transitive dependencies.
   - Linked tables through foreign keys.

The **final relational model** was designed in **Draw.io** and is included in `/database/model.png`.

---

## 💾 Database Creation
1. Open MySQL and run the **schema.sql** file:
```sql
SOURCE database/schema.sql;
