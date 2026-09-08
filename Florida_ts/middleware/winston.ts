import winston from 'winston';

// Базовые форматы для файлов (JSON со стеком ошибок)
const logFormat = winston.format.combine(
  winston.format.errors({ stack: true }), // Обязательно для сохранения stack trace ошибок
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'flowerida-backend' }, // Актуальное имя нашего проекта
  transports: [
    // Запись только ошибок
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Запись всех логов уровня info и выше
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Если мы разрабатываем локально (не в продакшене), дублируем логи в консоль красивым текстом
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Раскрашивает уровни (error - красный, info - зеленый)
        winston.format.simple()    // Выводит как понятную строку, а не JSON
      ),
    })
  );
}

export default logger;