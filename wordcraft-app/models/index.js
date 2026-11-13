const sequelize = require('../config/db');
const List = require('./list');
const Word = require('./word');
const Motivation = require('./motivation');
const Score = require('./score');

// Связь: у одного списка много слов. При удалении списка удаляются и его слова.
List.hasMany(Word, { foreignKey: 'listId', onDelete: 'CASCADE' });
Word.belongsTo(List, { foreignKey: 'listId' });

module.exports = {
    sequelize,
    List,
    Word,
    Motivation,
    Score
};