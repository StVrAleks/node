import Router from 'express';
const router = Router();

import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import jwt from 'jsonwebtoken';

import favoriteSSRController from '../controllers/FavoriteSSRController.js';
import cabinetController from '../controllers/cabinetController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import checkRole from '../middleware/checkRoleMiddleware.js'; 
import {User} from '../models/models.js'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Универсальная функция рендеринга лейаута
function renderWithLayout(viewName: string, viewData: object, request: any, response: any, next: any) {
    try {
        const viewPath = path.join(__dirname, '..', '..', 'views', `${viewName}.hbs`);
        const layoutPath = path.join(__dirname, '..', '..', 'views', 'layouts', 'main.hbs');

        const viewString = fs.readFileSync(viewPath, 'utf8');
        const layoutString = fs.readFileSync(layoutPath, 'utf8');

        const viewTemplate = Handlebars.compile(viewString);
        const layoutTemplate = Handlebars.compile(layoutString);

       // let currentUser = null;
        const cookieToken = request.cookies?.floweridaKey; // Читаем куку

        if (cookieToken && cookieToken.startsWith('Bearer ')) {
            try {
                const tokenStr = cookieToken.split(' ')[1];
                // Расшифровываем токен с помощью вашего секретного ключа из .env
               let currentUser = jwt.verify(tokenStr, process.env.SECRET_KEY || 'secret_fallback');
            } catch (e) {
                // Если токен сломан или истек, игнорируем, пользователь останется гостем
            }
        }

        const viewHTML = viewTemplate(viewData);
        const finalHTML = layoutTemplate({
            conteiner: viewHTML,
            user: request.user || null // Данные пользователя для шапки сайта
        });

        return response.send(finalHTML);
    } catch (error) {
        return next(error);
    }
}

// Хелпер сравнения для Handlebars
Handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

// 1. Главная страница
router.get(['/', '/home', '/home.html'], (req, res, next) => {
    renderWithLayout('home', { image: '/public/images/shop.jpg' }, req, res, next);
});

// 2. Регистрация
router.get(['/registration', '/registration_user.html'], (req, res, next) => {
    renderWithLayout('registration', { welcom: 'Пожалуйста, заполните форму регистрации' }, req, res, next);
});

// 3. Настройка входа (Логин)
router.get(['/login', '/login_user.html'], (req, res, next) => {
    renderWithLayout('login', { welcom: 'Пожалуйста, заполните форму', suc: req.query.suc || "" }, req, res, next);
});

// 4. Корзина (Добавили недостающий маршрут!)
router.get(['/cart', '/cart.html'], authMiddleware, (req, res, next) => {
    renderWithLayout('cart', { welcom: 'Ваша корзина' }, req, res, next);
});

// 5. Личный кабинет (Оставляем один роут через контроллер)
router.get('/cabinet', authMiddleware, async (req: any, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.redirect('/login');

        // Вытягиваем свежие данные профиля для Могилева напрямую при рендере страницы
        const currentUser = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
        });

        if (!currentUser) return res.redirect('/login');

        // Используем вашу родную функцию, которая точно умеет собирать main.hbs + cabinet.hbs
        renderWithLayout('cabinet', { 
            welcom: 'Добро пожаловать в личный кабинет',
            user: currentUser.toJSON() 
        }, req, res, next);

    } catch (error) {
        return next(error);
    }
});

// 6. Избранное 
router.get(['/favorites'], authMiddleware, favoriteSSRController.renderFavorites); 

// 7. Админка (Строгий доступ по роли ADMIN)
router.get(['/adminka', '/adminka.html'], checkRole('ADMIN'), (req, res, next) => {
    renderWithLayout('adminka', { welcom: 'Добро пожаловать в центр администрирования сайтом' }, req, res, next);
});

// 8. Каталог товаров
router.get(['/catalog', '/catalog.html'], (req, res, next) => {
    renderWithLayout('catalog', { welcom: 'Добро пожаловать в каталог' }, req, res, next);
});

// 9. Карточка конкретного цветка
router.get(['/flower', '/flower.html'], (req, res, next) => {
    const id = req.query.id as string;
    renderWithLayout('flower', { id: id }, req, res, next);
});

export default router;