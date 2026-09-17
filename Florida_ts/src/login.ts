declare global {
    interface Window {
        openReg: () => void;
    }
}



document.addEventListener('DOMContentLoaded', () : void => {

const formLogin= (document.getElementById('form-login-user') as HTMLFormElement) || null;

function sendLogin(){
const email = (document.getElementById('email') as HTMLInputElement) || null;
const password = (document.getElementById('password') as HTMLInputElement) || null;
const mist = (document.getElementById('mist') as HTMLElement) || null;
const regLogin = document.getElementById('regLogin') as HTMLElement || null;

if (!email || !password) return;

if(regLogin)
    regLogin.addEventListener('click', (event : Event) => {window.location.href = '/registration_user.html';})

fetch('api/user/login',{
        method: "POST",
        headers: {"content-Type": "application/json"},
        body: JSON.stringify({"email": email.value, "password": password.value})
        })
        .then((response) => response.json())
        .then(data => {
            if(data.mes){
                if(mist) mist.innerHTML = data.mes;
            }
            else if(data.key) 
            {
                localStorage.setItem('floweridaKey', data.key);
                window.location.href = '/home.html';
            } 
        }).catch((error)=> console.log(error));
}

formLogin?.addEventListener('submit', (e: Event)  : boolean =>{
    e.preventDefault();
    sendLogin();
    return true;
});

});
export {}