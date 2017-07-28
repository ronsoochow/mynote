const APIError = require('../rest').APIError;

const Sequelize = require('sequelize');

const config = require('../config');


var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});



var Note = sequelize.define('note', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    adddate: Sequelize.DATE,
    notecontent: Sequelize.STRING(500)
}, {
        timestamps: false
    });

//var now = Date.now();


module.exports = {
    'GET /api/notes': async (ctx, next) => {
        ctx.rest({
            notes: await Note.findAll()
        });
    },

    'POST /api/notes': async (ctx, next) => {
        var t = ctx.request.body;
        if (!t.notecontent || !t.notecontent.trim()) {
            throw new APIError('invalid_input', 'Missing Content');
        }
        var n = await Note.create({
            adddate: Date.now(),
            notecontent: t.notecontent.trim()
        })
        ctx.rest(n);
    },

    'PUT /api/notes/:id': async (ctx, next) => {
        var t = ctx.request.body;
        if (!t.notecontent || !t.notecontent.trim()) {
            throw new APIError('invalid_input', 'Missing Content');
        }
        var n = await Note.findById(ctx.params.id);
        n.notecontent = t.notecontent.trim();
        await n.save();
        ctx.rest(n)
    },

    'DELETE /api/notes/:id': async (ctx, next) => {
        var n = await Note.findById(ctx.params.id);
        await n.destroy();
        ctx.rest(n);
    }



}
