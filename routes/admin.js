var express = require('express');
var router = express.Router();

const admin = {
  email:'admin@admin.com',
  password:'admin'
}

/** Login Page */
router.get('/login', function(req, res, next) {
  console.warn('HERE')
  res.render('admin/login', {  });
});

/** Login Post */
router.post('/login', function(req, res, next) {
  const { email, password } = req.body;
  const emailExist = admin.email === email;
  if(emailExist){
    if(admin.password == password){
      // console.log('LOGİN success')
      //TODO set cookie
      res.redirect('/admin/');
    }else{
      // console.log('ŞİFre yanlış')
      res.render('admin/login', { message:'Admin Not Found' });
    }
  }else{
    // console.log('Böyle bi email yok')
    res.render('admin/login', { message:'Admin Not Found' });
  }
});

/** Home */
router.get('/', function(req, res, next) {
  res.render('admin/index', {  });

});

module.exports = router;
