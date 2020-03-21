var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Post } =  require('../helpers/database');


/** Login Page */
router.get('/login', function(req, res, next) {
  res.render('admin/login', {  });
});


/** Forgot Password Page */
router.get('/forgot-password', function(req, res, next) {
  res.render('admin/forgot-password', {});
});

/** Login Post */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await Admin.findOne({ where: { email } });

    if(!user){
      res.render('admin/login', { message:'Admin Not Found' });
    }else{
      const compare = await bcrypt.compare(password,user.password);
      if(compare){
        const adminToken = jwt.sign(
          {
            id: user.id,
            email: user.email,
            status: user.status
          }, 
          req.app.get('admin_secret_key'), 
        );
        //SET COOKIE
        res.cookie('adminToken', adminToken, {
          expires: new Date(Date.now() + 5 * 10000000)
        });
        res.redirect('/admin/');
      }else{
        console.log('Şifre yanlış')
        res.render('admin/login', { message:'Admin Not Found' });
      }
    }
  } catch (error) {
    res.render('admin/login', { message:'An Error Occured' });
  }
});


/** Logout */
router.get('/logout', async (req, res, next) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login')
});

/** Home */
router.get('/',async function(req, res, next) {
  console.log('REQ ',req.decoded)
  res.render('admin/index', {  });
});


/** Create Post - Get Method */
router.get('/add-post', function(req, res, next) {
  res.render('admin/addPost', {  });

});


/** Create Post - Post Method */
router.post('/add-post',async (req, res, next) => {
  try {
    
    const { title, thumbnail, content } = req.body;

    const result = await Post.create({ title, thumbnail, content });

    console.log(result);

  } catch (error) {
    console.log('Error on add-post[post]')
  }

  res.render('admin/addPost');
});


/** Posts */
router.get('/posts', function(req, res, next) {
  res.render('admin/posts', {  });

});

module.exports = router;
