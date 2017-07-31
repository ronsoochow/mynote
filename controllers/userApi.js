const APIError = require('../rest').APIError;

const Sequelize = require('sequelize');

const config = require('../config');

const crypto = require('crypto');

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

/* 
 * 哈希加密算法，不可逆 
 */

// md5：把一个任意长度的字节串变换成一定长的大整数，哈希值大小16个字节  
function pwdmd5(content) {
    var md5 = crypto.createHash('md5');
    md5.update(content);
    var md5dig = md5.digest('hex');
    //console.log(md5dig);// 输出：5f4dcc3b5aa765d61d8327deb882cf99  
    return md5dig;
}



var User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    adddate: Sequelize.DATE,
    username: Sequelize.STRING(50),
    password: Sequelize.STRING(50)
}, {
        timestamps: false
    });




module.exports = {
    'POST /api/checkuserlogin': async (ctx, next) => {
       if(ctx.session.username){
            //console.log("1");
            ctx.rest({ islogin: "1" });
        }
        else{
            //console.log("0");
             ctx.rest({ islogin: "0" });
        }
    },

    'POST /api/users': async (ctx, next) => {
        var t = ctx.request.body;
        if (!t.addusername || !t.addusername.trim()) {
            throw new APIError('invalid_input', 'Missing Username');
        }
        if (!t.addpassword || !t.addpassword.trim()) {
            throw new APIError('invalid_input', 'Missing Password');
        }
        var pwd = pwdmd5(t.addpassword);
        var n = await User.create({
            adddate: Date.now(),
            username: t.addusername.trim(),
            password: pwd
        })
        ctx.rest(n);
    },

    'POST /api/userslogin': async (ctx, next) => {
        var t = ctx.request.body;
        if (!t.username || !t.username.trim()) {
            throw new APIError('invalid_input', 'Missing Username');
        }
        if (!t.password || !t.password.trim()) {
            throw new APIError('invalid_input', 'Missing Password');
        }
        var pwd = pwdmd5(t.password);
        var n = await User.findAll({
            where: {
                username: t.username.trim()
            }
        });
        if (n.length == 0) {
            ctx.rest({ issuccess: "2" });
        }
        else {
            var s = n[0];
            if (s.password == pwd) {
                ctx.rest({ issuccess: "1" });
                //ctx.cookies.set("login", "234", {});
                ctx.session.username=t.username;
                //console.log(ctx.session.user);
            }
            else {
                ctx.rest({ issuccess: "0" });
            }
        }
        //issuccess:1为成功，0为失败，2为不存在此用户


    },

    'POST /api/userslogout': async (ctx, next) => {

        ctx.session=null;
        ctx.rest({out:"1"});


    }







}
