import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/index.js'; 
import viewRouter from './routes/viewRouter.js';
import errorHandler from './middleware/errorHandlingMiddleware.js'; 
import logger from './middleware/winston.js';
import sequelize from './db.js';
import './models/models.js'; 
import { sha256 } from 'js-sha256'; 
import { User, Basket } from './models/models.js';

dotenv.config();
const PORT = process.env.PORT || 8181;
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ROOT_DIR = process.cwd(); 
const publicPath = path.join(ROOT_DIR, 'public');

// ==========================================
// 1. РАЗДАЧА СТАТИКИ (Строго ДО маршрутизации роутов)
// ==========================================

// Папка public (стили, картинки интерфейса)
app.use('/public', express.static(publicPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); 
    }
  }
}));

// ЖЕСТКАЯ РАЗДАЧА СКОМПИЛИРОВАННОГО ФРОНТЕНДА БЕЗ ПЕРЕХВАТА РОУТАМИ
// Теперь types.js и adminka.js будут отдаваться как чистый javascript
app.use('/dist/src', express.static(path.join(ROOT_DIR, 'src', 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript'); // Гарантия для ESM модулей браузера
    }
  }
}));

app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/imgStoreMINI', express.static(path.join(publicPath, 'imgStoreMINI')));
app.use('/imgStore', express.static(path.join(publicPath, 'imgStore')));
// ==========================================
// 2. МАРШРУТИЗАЦИЯ API И СТРАНИЦ HBS
// ==========================================
app.use('/api', router); 
app.use('/', viewRouter); 

// 3. Обработка несуществующих роутов
app.use((req, res, next) => {
  res.status(404).send(`Маршрут ${req.originalUrl} не найден на сервере. Проверьте viewRouter.`);
});

// 4. Логгер ошибок
app.use(errorHandler);

const start = async () => {
     try {
        await sequelize.authenticate();
      // await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      //  await sequelize.sync({ alter: true });
        await sequelize.sync();
      // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
       //await sequelize.sync({ force: true });
        logger.info('База данных Flowerida успешно подключена (без опасного метода sync)');

        // СИДЕР: АВТО-СОЗДАНИЕ АДМИНИСТРАТОРА
        const adminEmail = 'admin@flowerida.by';
        const adminPasswordRaw = 'admin12345'; 

        const adminExists = await User.findOne({ where: { email: adminEmail } });
        
        if (!adminExists) {
            // Исправлен приоритет сложения строк в скобках
            const salt = process.env.SALT || '';
            const userPas = adminPasswordRaw + salt;
            const hashedPassword = sha256(userPas);

            const newAdmin = await User.create({
                name: 'Главный Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                user_status: 'enable', 
                created_user: 1
            });

            await Basket.create({ userId: newAdmin.id });
          
            console.log('==================================================');
            console.log(`[Flowerida] Авто-создан аккаунт администратора:`);
            console.log(`Логин: ${adminEmail}`);
            console.log(`Пароль: ${adminPasswordRaw}`);
            console.log('==================================================');
          }

        app.listen(PORT, () => {
            logger.info(`Сервер Flowerida успешно запущен на порту ${PORT}`);
            console.log(`Сервер запущен: http://localhost:${PORT}`);
        });

    } 
    catch (e: any){
        logger.error('Критическая ошибка при запуске сервера Flowerida:', e.message);
        console.error(e);
    }
}
start();