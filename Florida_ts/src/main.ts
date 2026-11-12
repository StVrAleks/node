import { initAuthModule } from './modules/registration.module.js';
import { initLoginModule } from './modules/login.modules.js';
import { initHomeModule } from './modules/home.modules.js';
import { initAccountModule } from './modules/account.modules.js';

import { ProductPageController } from './modules/product/product-main.js';


// 2. Ждем, пока браузер полностью загрузит DOM-дерево
document.addEventListener('DOMContentLoaded', () => {
   
const countBubble = document.querySelector('[data-cart-count]');
if (countBubble && !countBubble.textContent?.trim()) {
    fetch('/api/basketUser/cart')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && data.cartCount !== undefined) {
                countBubble.textContent = String(data.cartCount);
            }
        })
        .catch(() => {});
}

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

    if (document.getElementById('conteiner') && document.getElementsByClassName('product-page-wrapper')?.length>0) {
        console.log(document.getElementsByClassName('product-page-wrapper')?.length);
        console.log(document.getElementsByClassName('product-page-wrapper')[0]);
         const controller = new ProductPageController();
         controller.initFlowerModule();
    }

    /*if(document.getElementById("cart-content-wrapper")){
        console.log(document.getElementsByClassName('cart-content-wrapper')?.length);
        const cartController = new CartPageController();
        cartController.initCartModule();
    }*/

});