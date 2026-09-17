import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/index.js'; // Главный роутер, куда мы всё перенесли
import errorHandler from './middleware/errorHandlingMiddleware.js'; // Ваша middleware ошибок
import logger from './middleware/winston.js';
import sequelize from './db.js';
import './models/models.js'; // Импорт для инициализации связей в MySQL
import { sha256 } from 'js-sha256'; 
import { User, Basket } from './models/models.js';
dotenv.config();
const PORT = process.env.PORT || 8181;
const app = express();
import viewRouter from './routes/viewRouter.js';
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Кэширование и раздача статических файлов (css, изображения, JS фронтенда)
const publicPath = path.join(__dirname, '..', 'public');
app.use('/public', express.static(publicPath, {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Кэш на год для картинок
    }
  }
}));
app.use('/dist/src', express.static(path.join(__dirname, 'src'))); 
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use('/imgStoreMINI', express.static(path.join(__dirname, '..', 'imgStoreMINI')));
app.use(express.json());
// 3. Подключение единой точки маршрутизации (включая API и ваш viewRouter страниц)
app.use('/api', router);
app.use('/', viewRouter); 
// 4. Последний рубеж — обработка ошибок (обязано идти в самом конце после роутов!)
app.use(errorHandler);

const start = async () => {
     try {
        await sequelize.authenticate();
        await sequelize.sync(); // База синхронизирована
        
        logger.info('База данных Flowerida успешно подключена и синхронизирована');

        // ========================================================
        // СИДЕР: АВТО-СОЗДАНИЕ АДМИНИСТРАТОРА С СОЛЬЮ
        // ========================================================
        const adminEmail = 'admin@flowerida.by';
        const adminPasswordRaw = 'admin12345'; // Ваш пароль в чистом виде для формы входа

        // Проверяем, есть ли уже этот админ в базе
        const adminExists = await User.findOne({ where: { email: adminEmail } });
        
        if (!adminExists) {
            // Генерируем хэш СТРОГО по правилам вашего userController
            const salt = process.env.SALT || '';
            const userPas = adminPasswordRaw + salt;
            const hashedPassword = sha256(userPas);

            // Создаем администратора
            const newAdmin = await User.create({
                name: 'Главный Администратор',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                user_status: 'активен', // Проверьте точный статус, если в модели перечисление
                created_user: 1
            });

            // Сразу создаем для него пустую корзину, чтобы бэкенд не ругался при логине
            await Basket.create({ userId: newAdmin.id });
            
            console.log('==================================================');
            console.log(`[Flowerida] База была пуста. Авто-создан аккаунт:`);
            console.log(`Логин: ${adminEmail}`);
            console.log(`Пароль: ${adminPasswordRaw}`);
            console.log('==================================================');
        }
        // ========================================================

        app.listen(PORT, () => {
            logger.info(`Сервер Flowerida успешно запущен на порту ${PORT}`);
            console.log(`Сервер запущен: http://localhost:${PORT}`);
        });

    } 
    catch (e : any){
        logger.error('Критическая ошибка при запуске сервера Flowerida:', e.message);
        console.error(e);
    }
}
start();

