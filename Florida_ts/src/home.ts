document.addEventListener('DOMContentLoaded', (): void => {

const authoriz = document.getElementById('autorization') as HTMLInputElement | null;
const registration = document.getElementById('registration') as HTMLInputElement | null;
const guest = document.getElementById('guest') as HTMLInputElement | null;

if(authoriz)
    authoriz.addEventListener('click', (event : Event) : void => { (window).location.href = "/login_user.html";} )

if(registration)
    registration.addEventListener('click', (event : Event) : void => { window.location.href = "/registration_user.html";} )

if(guest)
    guest.addEventListener('click', (event : Event) : void => { console.log('Добро пожаловать, гость!');} )

});

