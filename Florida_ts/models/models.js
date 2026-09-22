import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';
;
const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING, unique: true },
    address: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    user_status: { type: DataTypes.STRING, defaultValue: 'disable' },
    created_user: { type: DataTypes.INTEGER, defaultValue: Math.floor(Date.now() / 1000) },
    role: { type: DataTypes.STRING, defaultValue: 'USER' }
});
;
const Basket = sequelize.define('basket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    }
});
;
const BasketFlower = sequelize.define('basket_flower', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    basketId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'baskets', key: 'id' }, onDelete: 'CASCADE' },
    flowerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'flowers', key: 'id' }, onDelete: 'CASCADE' },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false }
});
;
const Flowers = sequelize.define('flowers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'В наличии' },
    vidId: { type: DataTypes.INTEGER, allowNull: false,
        references: {
            model: 'flower_vid', // Имя таблицы видов в базе данных
            key: 'id'
        } },
    vidName: {type: DataTypes.VIRTUAL,
         get() {
            const vidInfo = this.flower_vid || this.Vid || this.vid;
            return vidInfo?.name || ''; }
       // get() { return this.flower_vid?.name || '';  }
    },        
    mKeyWords: { type: DataTypes.STRING },
    mDescript: { type: DataTypes.STRING }
});
;
const Vid = sequelize.define('flower_vid', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
});
;
const Favorite = sequelize.define('flower_Favorite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    flowerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'flowers', key: 'id' }, onDelete: 'CASCADE' }
});
;
const FlowerInfo = sequelize.define('flower_info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    flowerId: { type: DataTypes.INTEGER, allowNull: false,
        references: {
            model: 'flowers', // Имя таблицы видов в базе данных
            key: 'id'
        },
        onDelete: 'CASCADE' }
});
;
const FlowerImgs = sequelize.define('flower_imgs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    num: { type: DataTypes.INTEGER },
    img: { type: DataTypes.STRING, allowNull: false },
    flowerId: { type: DataTypes.INTEGER, allowNull: false,
        references: {
            model: 'flowers', // Имя таблицы видов в базе данных
            key: 'id'
        },
        onDelete: 'CASCADE' }
});
export class Order extends Model {
    id;
    userId;
    totalPrice;
    phone;
    address;
    status;
    createdAt;
    updatedAt;
}
export class OrderFlower extends Model {
    id;
    orderId;
    flowerId;
    quantity;
    price;
}
// --- 3. ИНИЦИАЛИЗАЦИЯ МОДЕЛЕЙ В SEQUELIZE ---
Order.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Новый',
        validate: { isIn: [['Новый', 'Готовится', 'В пути', 'Доставлено', 'Отменен']] }
    }
}, { sequelize, modelName: 'order' });
OrderFlower.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    flowerId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { sequelize, modelName: 'order_flower', timestamps: false });

//у покупателя м.б. много позиций в карзине, 1 карзина принадлежит 1 покупателю
User.hasOne(Basket, { foreignKey: 'userId' });
Basket.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Favorite);
Favorite.belongsTo(User);
Basket.hasMany(BasketFlower);
BasketFlower.belongsTo(Basket, { foreignKey: 'basketId' });
//BasketFlower.belongsTo(User);
Vid.hasMany(Flowers, { foreignKey: 'vidId' });
Flowers.belongsTo(Vid, { foreignKey: 'vidId' });
// Связь M:N — В корзине много цветов, цветы могут быть во многих корзинах
Basket.belongsToMany(Flowers, { through: BasketFlower, foreignKey: 'basketId' });
Flowers.belongsToMany(Basket, { through: BasketFlower, foreignKey: 'flowerId' });
// Связь M:N — Избранное (User <-> Flowers)
User.belongsToMany(Flowers, { through: Favorite, foreignKey: 'userId' });
Flowers.belongsToMany(User, { through: Favorite, foreignKey: 'flowerId' });
Flowers.hasMany(FlowerInfo, { foreignKey: 'flowerId' });
FlowerInfo.belongsTo(Flowers, { foreignKey: 'flowerId' });
//Flowers.BelongsToMany(FlowerInfo);//, {through: FlowerInfoItem });
Flowers.hasMany(FlowerImgs, { foreignKey: 'flowerId' });
FlowerImgs.belongsTo(Flowers, { foreignKey: 'flowerId' });
//Favorite.hasOne(Flowers);
//Flowers.belongsTo(Favorite);
// --- 4. ОПИСАНИЕ СВЯЗЕЙ (Обычно внизу файла моделей) ---
// Связь Пользователь -> Заказы (Запрещаем каскадное удаление заказов при удалении юзера)
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: 'userId' });
// Связь Заказ -> Позиции цветов в заказе (Каскадное удаление позиций при удалении самого заказа)
Order.hasMany(OrderFlower, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderFlower.belongsTo(Order, { foreignKey: 'orderId' });
// Связь Цветок -> Позиция в заказе (Запрещаем удалять цветок из каталога, если он есть в истории покупок)
Flowers.hasMany(OrderFlower, { foreignKey: 'flowerId', onDelete: 'RESTRICT' });
OrderFlower.belongsTo(Flowers, { foreignKey: 'flowerId' });
export { User, Basket, BasketFlower, Flowers, Vid, Favorite, FlowerInfo, FlowerImgs };
