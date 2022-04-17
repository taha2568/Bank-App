let account = null;
const storageKey = 'savedAccount'

const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

// global variables

const routes = {
    '/login' : {templateId: 'login-signup'},
    '/dashboard' : {templateId: 'dashboard', init: updateDashboard},
    '/add' : {templateId : 'add-transaction-template'}
};

function init(){
    account = JSON.parse(localStorage.getItem(storageKey))
    if(!account) {
        updateRoute();
    }else {
        navigate('/dashboard')
    }
}

function updateRoute(){
    let visible_section = document.getElementById('visible-section');

    let path = window.location.pathname;
    let route = routes[path];
    if(!route){
        console.log('redirect')
        return navigate('login'); //redirect to login page
    }

    //changing the style of body for showing different templates
    if(route.templateId === 'dashboard') {
        document.body.id = 'body-dashboard-grid';
        visible_section.className = 'dashboard-box';
    }else if (route.templateId === 'add-transaction-template') {
        document.body.id = 'body-add-transaction-grid';
        visible_section.className = 'add-transaction-box';
    }else {
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

function goAddTransactionPage(e){
    navigate('add');
}

function logout() {
    localStorage.removeItem(storageKey);
    navigate('login')
}

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
    localStorage.setItem(storageKey, JSON.stringify(result));
    console.log(JSON.parse(localStorage.getItem(storageKey)))
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

async function updateDashboard() {
    if(!account){
        return navigate('/login')
    }
    account = await getAccount(account.user)
    updateElement('dashboard-balance', account.balance.toFixed(2))
    updateElement('dashboard-currency', account.currency)
    updateElement('dashboard-username',`${account.user}'s budget`)

    let tbody = document.getElementById('tbody');
    tbody.textContent = '';
    for(const transaction of account.transactions){
        createTransactionRow(transaction);
    }
}

function createTransactionRow(transaction){
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

init();


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
