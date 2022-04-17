let account = null;
const storageKey = 'savedAccount'
const routes = {
    '/login' : {templateId: 'login-signup'},
    '/dashboard' : {templateId: 'dashboard', init: updateDashboard},
    '/add' : {templateId : 'add-transaction-template'}
};

function updateRoute(){
    let visible_section = document.getElementById('visible-section');

    let path = window.location.pathname;
    let route = routes[path];
    if(!route){
        console.log('redirect')
        return navigate('login'); //redirect to login page
    }

    if(route.templateId === 'dashboard') {
        // console.log('true')
        // console.log(`dashboard : value of account : ${account}`)
        document.body.id = 'body-dashboard-grid';
        visible_section.className = 'dashboard-box';
    }else if (route.templateId === 'add-transaction-template') {
        // console.log(`add : value of account : ${account}`)
        document.body.id = 'body-add-transaction-grid';
        visible_section.className = 'add-transaction-box';
    }else {
        // console.log('false')
        // console.log(`login : value of account : ${account}`)
        document.body.id = '';
        visible_section.className = '';
    }

    let template_id = route.templateId;
    let target_template = document.getElementById(template_id);
    let view = target_template.content.cloneNode(true);
    visible_section.innerHTML = '';
    visible_section.appendChild(view);
    if (typeof route.init === 'function') {
        route.init();
    }
}

function navigate(path){
    window.history.pushState({}, path, path);
    updateRoute();
}

function getURL(e){
    // e.preventDefault();
    navigate('add');
}

// function goDashboard() {
//     navigate('/dashboard');
// }

async function newTransaction() {
    let new_transaction_form = document.getElementById('new-transaction-form');
    let new_transaction_data = new FormData(new_transaction_form);
    let new_transaction_object = Object.fromEntries(new_transaction_data);
    let new_transaction_json = JSON.stringify(new_transaction_object);

    let response = await addNewTransaction(new_transaction_json);

    if(response.error){
        updateElement('new-transaction-error', response.error)
    }
    console.log('new transaction has been added!')
    account = await getAccount(account.user)
    navigate('/dashboard')
    updateDashboard();
    console.log(response)
    console.log(account)
}

async function addNewTransaction(new_transaction_json) {
    try {
        let response = await fetch(`//localhost:5000/api/accounts/${account.user}/transactions`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: new_transaction_json
        });
        return await response.json();
    }catch (e){
        return {error: e.message}
    }
}

window.addEventListener('popstate', () => {
    updateRoute();
});

async function register() {
    let register_form = document.getElementById('registerForm');
    let formData = new FormData(register_form);
    let data = Object.fromEntries(formData);
    let jsonData = JSON.stringify(data);
    let result = await createAccount(jsonData);

    if(result.error) {
        updateElement('re-error-message', result.error);
    }
    navigate('/login')
}

async function createAccount(account) {
    try {
        let response = await fetch('//localhost:5000/api/accounts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: account
        });
        return await response.json();
    }catch(e) {
        return {error: e.message}
    }
}

async function login(){
    let login_form = document.getElementById('loginForm');
    let username = login_form.username.value;
    let result = await getAccount(username);
    if(result.error){
        return updateElement('lo-error-message', result.error)
    }

    account = result;
    navigate('/dashboard')
}

async function getAccount(username) {
    try{
        let response = await fetch('//localhost:5000/api/accounts/' + encodeURIComponent(username))
        return await response.json();
    }catch(e){
        return {error: e.message}
    }
}

function updateElement(id, text_or_node){
    let element = document.getElementById(id);
    element.textContent = '';
    element.append(text_or_node);
}

function updateDashboard() {
    if(!account){
        return navigate('/login')
    }
    // console.log(`update account`);
    updateElement('dashboard-balance', account.balance.toFixed(2))
    updateElement('dashboard-currency', account.currency)
    updateElement('dashboard-username',`${account.user}'s budget`)

    // const transactionsRows = document.createDocumentFragment();
    let tbody = document.getElementById('tbody');
    tbody.textContent = '';
    for(const transaction of account.transactions){
        createTransactionRow(transaction);
        // tbody.appendChild(transaction_row);
        // transactionsRows.appendChild(transaction_row);
    }
    // console.log(account.transactions)
    // updateElement('transactions', transactionsRows);
}

function createTransactionRow(transaction){
    // let template = document.getElementById('transaction')
    // let transaction_row = template.content.cloneNode(true);
    // let tr = document.getElementById('trow')
    // tr.children[0].textContent = transaction.date;
    // tr.children[1].textContent = transaction.object;
    // tr.children[2].textContent = transaction.amount.toFixed(2);
    // return transaction_row;
    let tbody = document.getElementById('tbody');
    let tr = document.createElement('tr')
    let date = document.createElement('td')
    let object = document.createElement('td')
    let amount = document.createElement('td')
    date.textContent = transaction.date;
    object.textContent = transaction.object;
    amount.textContent = `${transaction.amount.toFixed(2)}${account.currency}`;
    tbody.appendChild(tr);
    tr.appendChild(date)
    tr.appendChild(object)
    tr.appendChild(amount)
}

// window.location.pathname = '/login';
updateRoute();


//**
const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = (()=>{
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
});
loginBtn.onclick = (()=>{
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
});
signupLink.onclick = (()=>{
    signupBtn.click();
    return false;
});
//**
