import { initAuthModule } from './modules/registration.module.js';
import { initLoginModule } from './modules/login.modules.js';
import { initHomeModule } from './modules/home.modules.js';
import { initAccountModule } from './modules/account.modules.js';

import { HeaderController } from './modules/header/header.module.js';
import { ProductPageController } from './modules/product/product-main.js';



// 2. Ждем, пока браузер полностью загрузит DOM-дерево
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.product-page-wrapper')) {
            new ProductPageController().initFlowerModule();
        }

/*const countBubble = document.querySelector('[data-cart-count]');
if (countBubble && !countBubble.textContent?.trim()) {
    fetch('/api/basketUser/cart')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && data.cartCount !== undefined) {
                countBubble.textContent = String(data.cartCount);
            }
        })
        .catch(() => {});
}*/

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


});

/*

// Пример реестра страниц/модулей в main.ts
const modulesRegistry = [
    { selector: '#form-reg-user', init: () => initAuthModule() },
    { selector: '#form-login-user', init: () => initLoginModule() },
    { selector: '#autentif', init: () => initHomeModule() },
    { selector: '#form-logOut-user', init: () => initAccountModule() },
    { selector: '.product-page-wrapper', init: () => new ProductPageController().initFlowerModule() },
];

document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем общие компоненты (например, шапку с корзиной)
    initHeaderModule();

    // Запускаем только те модули, чьи корневые контейнеры есть на странице
    modulesRegistry.forEach(({ selector, init }) => {
        if (document.querySelector(selector)) {
            init();
        }
    });
});
*/