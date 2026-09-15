import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

//покупатель
export interface UserAttributes  {
    id: number,
    name: string,
    email: string,
    password?: string,
    user_status: string,
    created_user: number,
    role: string
};
type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'user_status' | 'created_user'>;

const User = sequelize.define<Model<UserAttributes, UserCreationAttributes> & UserAttributes>( 'user', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type:DataTypes.STRING},
        email: {type:DataTypes.STRING, unique:true},
        password: {type:DataTypes.STRING},
        user_status: {type:DataTypes.STRING, defaultValue: 'disable'},
        created_user: {type: DataTypes.INTEGER,defaultValue: Math.floor(Date.now() / 1000)},
        role: {type:DataTypes.STRING, defaultValue: 'USER'}
    }
);

//корзина покупателя
interface BasketAttributes {
    id: number,
    userId: number;
};

type BasketCreationAttributes = Optional<BasketAttributes, 'id'>;

const Basket = sequelize.define<Model<BasketAttributes, BasketCreationAttributes> & BasketAttributes>( 'basket', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        userId:{
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
        }
    });

interface BasketFlowerAttributes {
    id: number,
    basketId: number;
    flowerId: number;
    quantity: number; 
};

type BasketFlowerCreationAttributes = Optional<BasketFlowerAttributes, 'id'>;

const BasketFlower = sequelize.define<Model<BasketFlowerAttributes, BasketFlowerCreationAttributes> & BasketFlowerAttributes>( 'basket_flower', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        basketId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'baskets', key: 'id' }, onDelete: 'CASCADE' },
        flowerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'flowers', key: 'id' }, onDelete: 'CASCADE' },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false }
    }
);

//описание цветов

export interface FlowerAttributes {
    id: number,
    name: string,
    price: number,
    vidId: number,    
    mKeyWords?: string | undefined,
    mDiscript?: string | undefined
};

type FlowerCreationAttributes = Optional<FlowerAttributes, 'id' | 'mKeyWords' | 'mDiscript'>;

const Flowers = sequelize.define<Model<FlowerAttributes, FlowerCreationAttributes> & FlowerAttributes>( 'flowers', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type:DataTypes.STRING, allowNull: false},
        price: {type:DataTypes.INTEGER, allowNull: false},
        vidId: {type:DataTypes.INTEGER,  allowNull: false,
            references: {
                model: 'flower_vids', // Имя таблицы видов в базе данных
                key: 'id'
            }},        
        mKeyWords: {type:DataTypes.STRING},
        mDiscript: {type:DataTypes.STRING}
    }
);
//роза, ромашка, кактус
export interface VidAttributes {
    id: number,
    name: string
};

type VidCreationAttributes = Optional<VidAttributes, 'id'>;

const Vid = sequelize.define<Model<VidAttributes, VidCreationAttributes> & VidAttributes>( 'flower_vid', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type:DataTypes.STRING, allowNull: false, unique: true},
    }
);

//избранное пользователя
interface FavoriteAttributes  {
    id: number;
    userId: number;
    flowerId: number;
};

type FavoriteCreationAttributes = Optional<FavoriteAttributes , 'id'>;

const Favorite = sequelize.define<Model<FavoriteAttributes , FavoriteCreationAttributes> & FavoriteAttributes>( 'flower_Favorite', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        flowerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'flowers', key: 'id' }, onDelete: 'CASCADE' }
    }
);

export interface FlowerInfoAttributes {
    id: number,
    title: string,
    description: string | undefined,
    flowerId: number
};

type FlowerInfoCreationAttributes = Optional<FlowerInfoAttributes, 'id' | 'description'>;

const FlowerInfo = sequelize.define<Model<FlowerInfoAttributes, FlowerInfoCreationAttributes> & FlowerInfoAttributes>( 'flower_info', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        title: {type:DataTypes.STRING, allowNull: false},
        description: {type:DataTypes.STRING, allowNull: true},
        flowerId: {type:DataTypes.INTEGER,  allowNull: false,
            references: {
                model: 'flowers', // Имя таблицы видов в базе данных
                key: 'id'
            },
         onDelete: 'CASCADE'}
    }
);

//картинки цветов
export interface FlowerImgsAttributes {
    id: number,
    num?: number,
    img: string,
    flowerId: number
};

type FlowerImgsCreationAttributes = Optional<FlowerImgsAttributes, 'id' | 'num'>;

const FlowerImgs = sequelize.define<Model<FlowerImgsAttributes, FlowerImgsCreationAttributes> & FlowerImgsAttributes>( 'flower_imgs', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        num: {type:DataTypes.INTEGER},
        img: {type:DataTypes.STRING, allowNull: false},
        flowerId: {type:DataTypes.INTEGER,  allowNull: false,
                    references: {
                        model: 'flowers', // Имя таблицы видов в базе данных
                        key: 'id'
                    },
                onDelete: 'CASCADE'}
});


export interface ApiResponse<T = any> {
    total?: number;
    pages?: number;
    currentPage?: number;
    mes?: string;
    message?: string;
    change?: string;
    rows?: T[];
}


//у покупателя м.б. много позиций в карзине, 1 карзина принадлежит 1 покупателю
User.hasOne(Basket, { foreignKey: 'userId' });
Basket.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Favorite);
Favorite.belongsTo(User);

Basket.hasMany(BasketFlower);
BasketFlower.belongsTo(User);

Vid.hasMany(Flowers, { foreignKey: 'vidId' })
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

Favorite.hasOne(Flowers);
Flowers.belongsTo(Favorite);

export {
    User,
    Basket,
    BasketFlower,
    Flowers,
    Vid,
    Favorite,
    FlowerInfo,
    FlowerImgs
}
