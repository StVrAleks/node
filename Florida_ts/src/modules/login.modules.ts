interface RegistrationData {
    nameUser: string;
    email: string;
    pasw: string;
}

let formElements: {
    feedbackForm: HTMLFormElement;
    regLogin: HTMLInputElement;
    email: HTMLInputElement;
    password: HTMLInputElement;
    mist: HTMLElement;
} | null = null;



export function initLoginModule(): void {
    const feedbackForm = document.getElementById('form-login-user') as HTMLFormElement;
    if (!feedbackForm) return;

    formElements = {
        feedbackForm,
        regLogin: document.getElementById('regLogin') as HTMLInputElement,
        email: document.getElementById('email') as HTMLInputElement,
        password: document.getElementById('password') as HTMLInputElement,
        mist: document.getElementById('mist') as HTMLElement,
    };

    formElements.regLogin.addEventListener('click', (event : Event) => {
        window.location.href = '/registration_user.html';
    })
    formElements.feedbackForm.addEventListener('submit', (e: Event)  : boolean =>{
            e.preventDefault();
            sendLogin();
            return true;
});
}

function sendLogin(){

if (!formElements?.email || !formElements?.password) return;

fetch('/api/user/login',{
        method: "POST",
        headers: {"content-Type": "application/json"},
        body: JSON.stringify({"email": formElements.email.value, "password": formElements.password.value})
        })
        .then((response) => response.json())
        .then(data => {
            if(data.mes){
                if(formElements?.mist) formElements.mist.textContent = data.mes;
            }
            else if(data.change === 'ok') 
            {
                window.location.href = '/';
            } 
        }).catch((error)=> console.log(error));
}