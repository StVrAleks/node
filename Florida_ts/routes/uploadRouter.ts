import Router from 'express';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import multer from 'multer';
import gm from 'gm';
import sharp from 'sharp';
import authMiddleware from '../middleware/authMiddleware.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';
import { fileURLToPath } from 'url';

const router = Router();

// Папка во внешнем корне проекта для временных оригиналов
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//const publicPathM: string = path.join(__dirname, '..', 'pictures');
const ROOT_DIR = process.cwd();
const publicPathM: string = path.join(ROOT_DIR, 'pictures');

// Убедимся, что временная папка существует, чтобы multer не падал
if (!fs.existsSync(publicPathM)) {
    fs.mkdirSync(publicPathM, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, publicPathM);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const uniqueSuffix: string = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension: string = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });
const serviceDownFiles = upload.fields([{ name: 'file', maxCount: 1 }]);

type MulterFields = {
    [fieldname: string]: Express.Multer.File[];
};

// CORS-ответы для загрузчика
router.options("/uploads", function (request: Request, response: Response, next: NextFunction) {
    try {  
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        return response.sendStatus(204);
    } catch (err) {
        return next(err);    
    }  
});

// Загрузка и нарезка изображения через GraphicsMagick
router.post("/uploads", authMiddleware('ADMIN'), serviceDownFiles, async function (req: Request, res: Response, next: NextFunction) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        const files = req.files as MulterFields | undefined;

        if (!files || !files['file'] || files['file'].length === 0) {
            return next(ApiError.internal('Ошибка сервера: Файл не найден'));
        }

        const fileData = files['file'][0];
        const image: string = fileData.filename;

        console.log("Processing image via GM...");


        let oldPath = path.join(ROOT_DIR, 'pictures', image);
        let newPath = path.join(ROOT_DIR, 'public', 'imgStoreMINI', image);
        let newPathBig = path.join(ROOT_DIR, 'public', 'imgStore', image);

        // Нарезка MINI
        
        await sharp(oldPath)
            .resize(200, 200, { fit: 'fill' })
            .flatten({ background: '#FFFFFF' }) // белый фон вместо .background()
            .toFile(newPath);
        console.log('MINI image ok');

        // Нарезка BIG
        await sharp(oldPath)
            .resize(400, 600, { fit: 'fill' })
            .flatten({ background: '#FFFFFF' })
            .toFile(newPathBig);
        console.log('BIG image ok');

        // Удаление временного оригинала
        await fsPromises.unlink(oldPath);
        console.log('Original temp file deleted');

        return res.send(image);  
    } catch (error: any) {
        return next(error);
    }
});

// Удаление физических файлов с сервера
router.post("/deleteImg", authMiddleware('ADMIN'), async function (request: Request, response: Response, next: NextFunction) {
    try {  
        const { name } = request.body;
        if (!name) return next(ApiError.internal('Картинка не была удалена: не указано имя файла'));

        let newPath: string = path.join(ROOT_DIR, 'public', 'imgStoreMINI', name);
        let newPathBig: string = path.join(ROOT_DIR, 'public', 'imgStore', name);

        try {
            await fsPromises.unlink(newPath);
        } catch (err: any) {
            logger.error(`Ошибка удаления MINI картинки ${name}:`, err.message);
        }

        try {
            await fsPromises.unlink(newPathBig);
        } catch (err: any) {
            logger.error(`Ошибка удаления BIG картинки ${name}:`, err.message);
        }
         
        return response.json({ change: 'ok' });           
    } catch (error: any) {
        return next(error);
    }
});

export default router;