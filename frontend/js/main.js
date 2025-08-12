import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/transactions';

const transactionsTable = document.getElementById('transactionsTable');
const transactionForm = document.getElementById('transactionForm');

async function getTransactions() {
    try {
        const res = await axios.get(API_URL);
        const data = res.data;

        transactionsTable.innerHTML = "";

        data.forEach(t => {
            transactionsTable.innerHTML += `
                <tr>
                    <td>${t.transaction_id}</td>
                    <td>${t.name_client}</td>
                    <td>${t.transaction_code}</td>
                    <td>${t.transaction_datetime ? t.transaction_datetime.split("T")[0] : ''}</td>
                    <td>${t.transaction_amount}</td>
                    <td>${t.transaction_status}</td>
                    <td>
                        <button onclick="editTransaction(${t.transaction_id})">Edit</button>
                        <button onclick="deleteTransaction(${t.transaction_id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading transactions: ", error);
    }
}

window.searchTransactionsByUser = async () => {
    const searchInput = document.getElementById('search_user_id').value;
    if (!searchInput) {
        alert("Please enter a client name or ID");
        return;
    }

    try {
        let res;
        const isNumeric = /^\d+$/.test(searchInput);

        if (isNumeric) {
            res = await axios.get(`${API_URL}/client-id/${searchInput}`);
        } else {
            res = await axios.get(`${API_URL}/client/${encodeURIComponent(searchInput)}`);
        }
        
        const data = res.data;

        transactionsTable.innerHTML = "";
        data.forEach(t => {
            transactionsTable.innerHTML += `
                <tr>
                    <td>${t.transaction_id}</td>
                    <td>${t.name_client}</td>
                    <td>${t.transaction_code}</td>
                    <td>${t.transaction_datetime ? t.transaction_datetime.split("T")[0] : ''}</td>
                    <td>${t.transaction_amount}</td>
                    <td>${t.transaction_status}</td>
                    <td>
                        <button onclick="editTransaction(${t.transaction_id})">Edit</button>
                        <button onclick="deleteTransaction(${t.transaction_id})">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error searching transactions:", error);
        alert("Error searching transactions");
    }
};

window.editTransaction = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    const t = res.data;

    document.getElementById("transaction_id").value = t.transaction_id;
    document.getElementById("transaction_code").value = t.transaction_code;
    document.getElementById("transaction_datetime").value = t.transaction_datetime ? t.transaction_datetime.split("T")[0] : "";
    document.getElementById("transaction_amount").value = t.transaction_amount;
    document.getElementById("transaction_status").value = t.transaction_status;
};

window.deleteTransaction = async (id) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
        await axios.delete(`${API_URL}/${id}`);
        getTransactions();
    }
};

getTransactions();