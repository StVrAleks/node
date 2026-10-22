import { initAuthModule } from './modules/registration.module.js';
import { initLoginModule } from './modules/login.module.js';
import { initHomeModule } from './modules/home.modules.js';
import { initAccountModule } from './modules/account.modules.js';

// 2. Ждем, пока браузер полностью загрузит DOM-дерево
document.addEventListener('DOMContentLoaded', () => {
   
    if (document.getElementById('form-reg-user')) {
        initAuthModule();
    }

    if (document.getElementById('form-login-user')) {
        initLoginModule();
    }

    if (document.getElementById('autentif')) {
        initHomeModule();
    }

    if (document.getElementById('form-logOut-user')) {
        initAccountModule();
    }
});