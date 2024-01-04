let savedTransactions = []

async function fetchTransactions () {
    return await fetch('http://localhost:3000/transactions').then(res => res.json())
}

async function saveTransaction () {

    const newTransaction = {
        name: document.querySelector('#name').value,
        amount: parseFloat(document.querySelector('#value').value),
        type: document.querySelector('#deposit').checked? document.querySelector('#deposit').dataset.value : document.querySelector('#debit').dataset.value
    }

    const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        body: JSON.stringify(newTransaction),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const transaction = await response.json()

    savedTransactions.push(transaction)
    renderTransaction(transaction)
    setBalance()

    document.querySelector('form').reset()

    document.querySelector('#saveBtn').disabled = true
}

function disableBtn () {

    const name = document.querySelector('#name').value
    const value = document.querySelector('#value').value
    const deposit = document.querySelector('#deposit')
    const debit = document.querySelector('#debit')

    if (name === '' || value === '' || (!deposit.checked && !debit.checked)) {

        document.querySelector('#saveBtn').disabled = true
    
    } else {

        document.querySelector('#saveBtn').disabled = false

    }
}

function createTransactionSection (index) {

    const div = document.createElement('div')

    div.id = `transaction${index}`
    div.classList.add('transaction')

    return div
}

function createTextContainer () {
    const div = document.createElement('div')

    div.classList.add('textContainer')

    return div
}

function createTransactionName (name) {

    const span = document.createElement('span')

    span.textContent = name
    span.classList.add('name')  

    return span
}

function createTransactionAmount (transaction) {

    const span = document.createElement('span')

    const formater = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    })

    span.textContent = formater.format(transaction.amount)
    span.classList.add('amount')  

    if (transaction.type === 'deposit') {
        span.classList.add('positive')
    } else if (transaction.type === 'debit') {
        span.classList.add('negative')
    }

    return span
}

function createBtnSpan () {

    const span = document.createElement('span')

    span.classList.add('btnSpan')

    return span
}

function createTransactionEditButton () {

    const btn = document.createElement('button')

    btn.classList.add('editBtn')
    btn.textContent = 'Edit'

    return btn
}

function createTransactionDeleteButton () {

    const btn = document.createElement('button')

    btn.classList.add('deleteBtn')
    btn.textContent = 'Delete'

    return btn
}

async function editAction (btn) {

    const transactionId = btn.parentNode.parentNode.id.replace(/transaction/, '')
    const nameInput = document.querySelector('#name')
    const valueInput = document.querySelector('#value')

    const transaction = await fetch(`http://localhost:3000/transactions/${transactionId}`).then(res => res.json())

    nameInput.value = transaction.name
    valueInput.value = transaction.amount
    if (transaction.type === 'deposit') {
        document.querySelector('#deposit').checked = true
    } else {
        document.querySelector('#debit').checked = true
    }

    const saveBtn = document.querySelector('#saveBtn')

    saveBtn.removeEventListener('click', saveButton)

    saveBtn.addEventListener('click', async function editTransaction (ev) {
    
        ev.preventDefault()
        
        const name = document.querySelector('#name').value
        const amount = parseFloat(document.querySelector('#value').value)
        const type = document.querySelector('#deposit').checked? 'deposit' : 'debit'
        let editedTransaction = await fetch(`http://localhost:3000/transactions/${transactionId}`).then(res => res.json())

        const newTransaction = await fetch(`http://localhost:3000/transactions/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({name, amount, type})
        }).then(res => res.json())

        savedTransactions.forEach(transaction => { 
            if (editedTransaction.id === transaction.id) {
                editedTransaction = transaction
        }})

        const editedTransactionIndex = savedTransactions.indexOf(editedTransaction)

        savedTransactions.splice(editedTransactionIndex, 1, newTransaction)

        const editedSection = document.querySelector(`#transaction${editedTransaction.id}`)
        const spanName = editedSection.querySelector(':first-child').querySelector(':first-child')
        const spanValue = editedSection.querySelector(':first-child').childNodes[1]

        const formater = Intl.NumberFormat('pt-BR', {
            compactDisplay: 'long',
            currency: 'BRL',
            style: 'currency'
        })

        spanName.textContent = name
        spanValue.textContent = formater.format(amount)
        spanValue.className = ''
        spanValue.classList.add('amount')
        if (type === 'deposit') {
            spanValue.classList.add('positive')
        } else if (type === 'debit') {
            spanValue.classList.add('negative')
        }

        setBalance()

        document.querySelector('#saveBtn').removeEventListener('click', editTransaction)
        document.querySelector('#saveBtn').addEventListener('click', saveButton)
        document.querySelector('form').reset()
    })
}

async function deleteAction (btn) {

    const index = btn.parentNode.parentNode.id.replace(/transaction/, '')

    let deletedTransaction = await fetch(`http://localhost:3000/transactions/${index}`).then(res => res.json())

    await fetch(`http://localhost:3000/transactions/${index}`, {
        method: 'DELETE'
    })

    savedTransactions.forEach(transaction => { 

        if (deletedTransaction.id === transaction.id) {
            deletedTransaction = transaction
        } 
    })

    const deletedTransactionIndex = savedTransactions.indexOf(deletedTransaction)

    savedTransactions.splice(deletedTransactionIndex, 1)

    const deletedSection = document.querySelector(`#transaction${deletedTransaction.id}`)

    document.querySelector('#transactions').removeChild(deletedSection)
    setBalance()
}

function renderTransaction(transaction) {

    const section = document.querySelector('#transactions')

    const div = createTransactionSection(transaction.id)
    const div2 = createTextContainer()
    const name = createTransactionName(transaction.name)
    const amount = createTransactionAmount(transaction)
    const span = createBtnSpan()
    const editBtn = createTransactionEditButton()
    const deleteBtn = createTransactionDeleteButton()

    editBtn.addEventListener('click', ev => {
        editAction(ev.target)
    })
    deleteBtn.addEventListener('click', ev => {
        deleteAction(ev.target)
    })

    div2.append(name, amount)

    span.append(editBtn, deleteBtn)

    div.append(div2, span)

    section.appendChild(div)
}

function setBalance () {

    const balanceSpan = document.querySelector('#balance')
    const balance = savedTransactions.reduce((sum, transaction) => {

        if (transaction.type === 'deposit') {
            sum += transaction.amount
        } else if (transaction.type === 'debit') {
            sum -= transaction.amount
        }

        return sum

    }, 0)
    const formater = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    })
    
    balanceSpan.className = ''

    if(balance > 0) {
        balanceSpan.classList.add('positive')
    } else if (balance < 0) {
        balanceSpan.classList.add('negative')
    }

    balanceSpan.textContent = formater.format(balance)
}

async function setup () {
    const results = await fetchTransactions()
    savedTransactions.push(...results)
    savedTransactions.forEach(renderTransaction)
    setBalance()
}

function saveButton (ev) {
    
    ev.preventDefault()
    saveTransaction()
}

function checkNumber (ev) {
    const tecla = ev.key;
    const teclaEhNumero = /^\d$/.test(tecla);
    const teclaEhPontoDecimal = tecla === '.';
    const teclaEhExclusao = ev.keyCode === 8 || ev.keyCode === 46;
  
    if (!(teclaEhNumero || teclaEhPontoDecimal || teclaEhExclusao)) {
      ev.preventDefault();
    }
}

document.addEventListener('DOMContentLoaded', setup)

document.querySelector('#saveBtn').addEventListener('click', saveButton)

document.querySelector('#saveBtn').addEventListener('mouseover', disableBtn)

document.querySelector('#value').addEventListener('keydown', checkNumber);