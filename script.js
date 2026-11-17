let transactions = JSON.parse(localStorage.getItem('transactions')) ?? [];

const transactionForm = document.querySelector('#transactionForm');
const transactionsList = document.querySelector('#transactionsList');

const totalBalance = document.querySelector('#totalBalance');
const totalIncome = document.querySelector('#totalIncome');
const totalExpenses = document.querySelector('#totalExpenses');

const titleInput = document.querySelector('#title');
const amountInput = document.querySelector('#amount');
const typeInput = document.querySelector('#type');
const categoryInput = document.querySelector('#category');
const dateInput = document.querySelector('#date');

const typeFilter = document.querySelector('#typeFilter');
const categoryFilter = document.querySelector('#categoryFilter');
const sortFilter = document.querySelector('#sortFilter');

const emptyState = document.querySelector('#emptyState');

const expenseChart = document.querySelector('#expenseChart');
const incomeChart = document.querySelector('#incomeChart');
let expenseChartInstance;

const today = new Date()
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]

document.querySelector('#date').value = localDate

function renderTransactions(transactionsToRender = transactions) {
    transactionsList.innerHTML = '';
    if (transactionsToRender.length === 0) emptyState.style.display = 'block'; 
    else {
        emptyState.style.display = 'none';
        transactionsToRender.forEach(item => {
            transactionsList.innerHTML += `
                <tr style="background-color: ${item.type === 'income' ? '#d4edda' : '#f8d7da'}" data-id="${item.id}">
                    <td>${item.title}</td>
                    <td>${item.category}</td>
                    <td>${item.date}</td>
                    <td>${item.type === 'income' ? '+' : '-'}${Math.abs(item.amount)} TMT</td>
                    <td>
                        <button class="delete-button">×</button>
                    </td>
                </tr>
            `
        });
    }
    updateBalance()
    updateExpenseChart()   
    localStorage.setItem('transactions', JSON.stringify(transactions))
}

renderTransactions(transactions);

function calculateIncome() {
    const income = transactions
        .filter(item => item.type === 'income')
        .reduce((acc, item) => acc + item.amount, 0);
    totalIncome.textContent = `+${income} TMT`;
    return income;
}

function calculateExpenses() {
    const expenses = transactions
        .filter(item => item.type === 'expense')
        .reduce((acc, item) => acc + item.amount, 0);
    totalExpenses.textContent = `-${expenses} TMT`;
    return expenses;
}

function calculateBalance() {
    const balance = calculateIncome() - calculateExpenses()
    totalBalance.textContent = `${balance} ТМТ`
    return balance
}

function updateBalance() {
    calculateIncome()
    calculateExpenses()
    calculateBalance()
}

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (titleInput.value.trim() != '' && Number(amountInput.value) > 0) {
        const newTransaction = {
            id: Date.now(),
            title: titleInput.value,
            amount: Number(amountInput.value),
            type: typeInput.value,
            category: categoryInput.value,
            date: dateInput.value
        };
        transactions.push(newTransaction)
        titleInput.value = ''
        amountInput.value = ''
        typeInput.value = 'expense'
        categoryInput.value = 'Food'
        dateInput.value = localDate
        renderTransactions()
    }
})

transactionsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-button')) { 
        const transactionElement = e.target.closest('tr')
        const transactionId = Number(transactionElement.dataset.id)
        
        transactions = transactions.filter(item => item.id !== transactionId)
        renderTransactions()
    }
})

typeFilter.addEventListener('change', filterTransactions)
categoryFilter.addEventListener('change', filterTransactions)
sortFilter.addEventListener('change', filterTransactions)

function filterTransactions() {
    const typeFilterValue = typeFilter.value
    const categoryFilterValue = categoryFilter.value
    const sortFilterValue = sortFilter.value

    let filteredTransactions = transactions.filter(item => {
        return (
            (typeFilterValue === 'all' || item.type === typeFilterValue) &&
            (categoryFilterValue === 'all' || item.category === categoryFilterValue)
        )
    })

    filteredTransactions = filteredTransactions.sort((a, b) => {
        if (sortFilterValue === 'oldest') {
            return new Date(a.date) - new Date(b.date)
        } else if (sortFilterValue === 'newest') {
            return new Date(b.date) - new Date(a.date)
        } else if (sortFilterValue === 'lowest') {
            return a.amount - b.amount
        } else if (sortFilterValue === 'highest') {
            return b.amount - a.amount
        }
    })

    renderTransactions(filteredTransactions)
}

function updateExpenseChart() {
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }
    const expenseCategories = [...new Set(transactions.filter(item => item.type === 'expense').map(item => item.category))];
    expenseChartInstance = new Chart(expenseChart, {
        type: 'doughnut',
        data: {
            labels: expenseCategories,
            datasets: [{
                data: expenseCategories.map(category => transactions.filter(item => item.type === 'expense' && item.category === category).reduce((acc, item) => acc + item.amount, 0)),
                backgroundColor: expenseCategories.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`),
            }]
        },
    });
}

