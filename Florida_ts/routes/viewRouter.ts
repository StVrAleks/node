import Router from 'express';
const router = Router();

import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';


import favoriteSSRController from '../controllers/FavoriteSSRController.js';
import cabinetController from '../controllers/cabinetController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// SSR-страницы для браузера
router.get('/cabinet', authMiddleware, cabinetController.renderCabinet);
router.get('/favorites', authMiddleware, favoriteSSRController.renderFavorites); // <--- ПОДВЯЗАЛИ SSR ТУДА
import checkRole from '../middleware/checkRoleMiddleware.js'; 


function renderWithLayout(viewName: string, viewData: object, request: any, response: any, next: any) {
    try {
       const viewPath = path.join(__dirname, '..', '..', 'views', `${viewName}.hbs`);
        const layoutPath = path.join(__dirname, '..', '..', 'views', 'layouts', 'main.hbs');

        const viewString = fs.readFileSync(viewPath, 'utf8');
        const layoutString = fs.readFileSync(layoutPath, 'utf8');

        const viewTemplate = Handlebars.compile(viewString);
        const layoutTemplate = Handlebars.compile(layoutString);

        const viewHTML = viewTemplate(viewData);
        const finalHTML = layoutTemplate({
            conteiner: viewHTML,
            user: request.user || null // Подстраховка от undefined для гостей
        });

        return response.send(finalHTML);
    } catch (error) {
        return next(error);
    }
}

Handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
    // Используем строгое сравнение === для безопасности типов TypeScript
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

// 1. Главная страница (двойной роут для совместимости)
router.get(['/', '/home', '/home.html'], (req, res, next) => {
    renderWithLayout('home', { image: '/public/images/shop.jpg' }, req, res, next);
});

// 2. Регистрация
router.get(['/registration', '/registration_user.html'], (req, res, next) => {
    renderWithLayout('registration', { welcom: 'Пожалуйста, заполните форму регистрации' }, req, res, next);
});

// 3. Логин
router.get(['/login', '/login_user.html'], (req, res, next) => {
    renderWithLayout('login', { welcom: 'Пожалуйста, заполните форму', suc: req.query.suc || "" }, req, res, next);
});

// 4. Личный кабинет (Защищенный)
router.get(['/cabinet', '/account.html'], authMiddleware, (req, res, next) => {
    renderWithLayout('cabinet', { welcom: 'Добро пожаловать в личный кабинет' }, req, res, next);
});

// 5. Админка (Строгий доступ по роли ADMIN)
router.get(['/adminka', '/adminka.html'], checkRole('ADMIN'), (req, res, next) => {
    renderWithLayout('adminka', { welcom: 'Добро пожаловать в центр администрирования сайтом' }, req, res, next);
});

// 6. Каталог товаров
router.get(['/catalog', '/catalog.html'], (req, res, next) => {
    renderWithLayout('catalog', { welcom: 'Добро пожаловать в каталог' }, req, res, next);
});

// 7. Карточка конкретного цветка (считываем id из query)
router.get(['/flower', '/flower.html'], (req, res, next) => {
    const id = req.query.id as string;
    renderWithLayout('flower', { id: id }, req, res, next);
});


export default router;