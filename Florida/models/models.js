const sequelize = require('../db');
const {DataTypes} = require('sequelize');


//покупатель
const User = sequelize.define( 'user', {
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
const Bascet = sequelize.define( 'basket', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
    }
);

const BascetFlower = sequelize.define( 'basket_flower', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
    }
);
//описание цветов
const Flowers = sequelize.define( 'flowers', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type:DataTypes.STRING, allowNull: false},
        price: {type:DataTypes.INTEGER, allowNull: false},
        mKeyWords: {type:DataTypes.STRING},
        mDiscript: {type:DataTypes.STRING}
    }
);
//роза, ромашка, кактус
const Vid = sequelize.define( 'flower_vid', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type:DataTypes.STRING, allowNull: false}
    }
);
//избранное пользователя
const Like = sequelize.define( 'flower_like', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        flag: {type:DataTypes.INTEGER, allowNull: false, defaultValue: '0'},
    }
);

const FlowerInfo = sequelize.define( 'flower_info', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        title: {type:DataTypes.STRING, allowNull: false},
        discription: {type:DataTypes.STRING, allowNull: false}
    }
);

//картинки цветов
const FlowerImgs = sequelize.define( 'flower_imgs', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        num: {type:DataTypes.INTEGER},
        img: {type:DataTypes.STRING, allowNull: false}
    }
);

//у покупателя м.б. много позиций в карзине, 1 карзина принадлежит 1 покупателю
User.hasOne(Bascet);
Bascet.belongsTo(User);

User.hasMany(Like);
Like.belongsTo(User);

Bascet.hasMany(BascetFlower);
BascetFlower.belongsTo(User);

Vid.hasMany(Flowers)
Flowers.belongsTo(Vid);

BascetFlower.hasOne(Flowers);
Flowers.belongsTo(BascetFlower);

Flowers.hasMany(FlowerInfo);
FlowerInfo.belongsTo(Flowers);
//Flowers.BelongsToMany(FlowerInfo);//, {through: FlowerInfoItem });

Flowers.hasMany(FlowerImgs);
FlowerImgs.belongsTo(Flowers);
//, { through: FlowerImgsItem });

Like.hasOne(Flowers);
Flowers.belongsTo(Like);

module.exports = {
    User,
    Bascet,
    BascetFlower,
    Flowers,
    Vid,
    Like,
    FlowerInfo,
    FlowerImgs
}
