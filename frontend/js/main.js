import axios from 'axios';

// Definición de las URLs de la API
const API_URL = 'http://localhost:3000/api/v1/transactions';
const CLIENTS_API_URL = 'http://localhost:3000/api/v1/clients';

// Referencias a los elementos del DOM
const transactionsTable = document.getElementById('transactionsTable');
const transactionForm = document.getElementById('transactionForm');
const clientSelect = document.getElementById('client_name');
const submitButton = document.querySelector('#transactionForm button[type="submit"]');
const clearButton = document.getElementById('clearButton');


let editingTransactionId = null;


async function loadClients() {
    try {
        const res = await axios.get(CLIENTS_API_URL);
        const clients = res.data;

        clientSelect.innerHTML = '<option value="">Select a client</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.client_id;
            option.textContent = client.name_client;
            clientSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading clients: ", error);
        alert("Error loading clients. Please try again.");
    }
}


function renderTransactionsTable(transactions) {
    let htmlContent = '';
    transactions.forEach(t => {
        htmlContent += `
            <tr>
                <td class="py-2 px-4">${t.transaction_id}</td>
                <td class="py-2 px-4">${t.name_client}</td>
                <td class="py-2 px-4">${t.transaction_code}</td>
                <td class="py-2 px-4">${t.transaction_datetime ? t.transaction_datetime.split("T")[0] : ''}</td>
                <td class="py-2 px-4">$${parseFloat(t.transaction_amount).toFixed(2)}</td>
                <td class="py-2 px-4">${t.transaction_status}</td>
                <td class="py-2 px-4">
                    <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-sm" onclick="editTransaction(${t.transaction_id})">Edit</button>
                    <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm" onclick="deleteTransaction(${t.transaction_id})">Delete</button>
                </td>
            </tr>
        `;
    });
    transactionsTable.innerHTML = htmlContent;
}


async function getTransactions() {
    try {
        const res = await axios.get(API_URL);
        renderTransactionsTable(res.data);
    } catch (error) {
        console.error("Error loading transactions: ", error);
        alert("Error loading transactions. Please try again.");
    }
}


window.clearForm = () => {
    transactionForm.reset();
    submitButton.textContent = "Nuevo";
    if(clearButton) clearButton.hidden = true; 
    editingTransactionId = null; 
}


transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientName = document.getElementById("client_name").value;
    const transactionCode = document.getElementById("transaction_code").value;
    const transactionAmount = document.getElementById("transaction_amount").value;
    const transactionDatetime = document.getElementById("transaction_datetime").value;
    const transactionStatus = document.getElementById("transaction_status").value;
    const transactionType = document.getElementById("transaction_type").value;
    const platformUsed = document.getElementById("platform_used").value;

    const cleanAmount = transactionAmount ? Number(String(transactionAmount).replace(/[$,]/g, '')) : 0;

    const transactionData = {
        client_id_fk: Number(clientName),
        transaction_code: transactionCode,
        transaction_amount: cleanAmount,
        transaction_datetime: transactionDatetime,
        transaction_status: transactionStatus,
        transaction_type: transactionType,
        platform_used: platformUsed
    };

    try {
        if (editingTransactionId) {
            await axios.put(`${API_URL}/${editingTransactionId}`, transactionData);
        } else {
            await axios.post(API_URL, transactionData);
        }
        clearForm();
        await getTransactions();
        alert("Transaction saved successfully!");
    } catch (error) {
        console.error("Error saving transaction:", error);
        alert("Error saving transaction. Please try again.");
    }
});

window.searchTransactionsByName = async () => {
    const searchInput = document.getElementById('search_name').value;
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
        
        renderTransactionsTable(res.data);
    } catch (error) {
        console.error("Error searching transactions:", error);
        alert("Error searching transactions");
    }
};


window.editTransaction = async (id) => {
    try {
        clearForm();
        const res = await axios.get(`${API_URL}/${id}`);
        const t = res.data;

        // Guarda el ID de la transacción en la variable.
        editingTransactionId = id;

        document.getElementById("client_name").value = t.client_id_fk;
        document.getElementById("transaction_code").value = t.transaction_code;
        document.getElementById("transaction_amount").value = t.transaction_amount;
        document.getElementById("transaction_datetime").value = t.transaction_datetime ? t.transaction_datetime.split("T")[0] : "";
        document.getElementById("transaction_status").value = t.transaction_status;
        document.getElementById("transaction_type").value = t.transaction_type;
        document.getElementById("platform_used").value = t.platform_used;
        
        submitButton.textContent = "Guardar Cambios";
        if(clearButton) clearButton.hidden = false; 
    } catch (error) {
        console.error("Error fetching transaction details:", error);
        alert("Error fetching transaction details for editing.");
    }
};


window.deleteTransaction = async (id) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
        try {
            await axios.delete(`${API_URL}/${id}`);
            getTransactions();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Error deleting transaction. Please try again.");
        }
    }
};


    loadClients();
    getTransactions();
