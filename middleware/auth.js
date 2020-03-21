const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    if(req.cookies.adminToken){
        try {
            if(req.url === '/login'){
                res.redirect('/admin');
            }else{
                req.decoded = jwt.verify(req.cookies.adminToken,config.admin_secret_key)
                next();
            }
        } catch (error) {
            res.clearCookie('adminToken');
            res.redirect('/admin');
        }
    }else{
        if(req.url === '/login'){
            next();
        }else{
            res.redirect('/admin/login');
        }
    }
};
