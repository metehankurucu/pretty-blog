var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Post, Photo } =  require('../helpers/database');
const config = require('../config');

//multer for file upload
var multer  = require('multer')
const storage = multer.diskStorage({
  destination:(req, file, callback) => {
    callback(null, './uploads/')
  },
  filename:(req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname)
  }
})
var upload = multer({ storage });


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


/** Post Page */
router.get('/post/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findOne({ where:{ id: postId} });
    res.render('admin/post', { post });
  } catch (error) {
    console.log(error);
    res.render('admin/post', {  });
  }
});


/** Post Update */
router.post('/post/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const { title, thumbnail, content } = req.body;
    const result = await Post.update({ title, thumbnail, content },{ where:{ id: postId }});
      
    const post = await Post.findOne({ where:{ id: postId } });
    res.render('admin/post', { post });
  } catch (error) {
    console.log(error);
    res.render('admin/post', {  });
  }
});

/** Hide Post */
router.get('/post/hide/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const result = await Post.update({ status:0 },{ where:{ id: postId }});
    res.redirect('/admin/post/' + postId);
  } catch (error) {
    console.log(error);
    res.redirect('/admin/post/' + postId);
  }
});

/** Make Visible Post */
router.get('/post/make-visible/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const result = await Post.update({ status:1 },{ where:{ id: postId }});
    res.redirect('/admin/post/' + postId);
  } catch (error) {
    console.log(error);
    res.redirect('/admin/post/' + postId);
  }
});

/** Delete Post */
router.get('/post/delete/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const result = await Post.destroy({ where:{ id: postId }});
    res.redirect('/admin/posts');
  } catch (error) {
    console.log(error);
    res.redirect('/admin/posts');
  }
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
router.get('/posts', async (req, res, next) => {
  try {
    const posts = await Post.findAll();
    for (const post of posts) {
      console.log("TİTLE ",post.title);
    }
    res.render('admin/posts', { posts });
  } catch (error) {
    console.log('EEROR',error);
    res.render('admin/posts', { posts:[] });
  }
});


/** Upload Photo Page */
router.get('/upload-photo', function(req, res, next) {
  res.render('admin/upload-photo', { });
});

/** Upload Photo Post */
router.post('/upload-photo',upload.single('photo'), async (req, res, next) => {
  try {
    const url = config.BASE_URL + req.file.path;
    const result = await Photo.create({ url });
    res.render('admin/upload-photo', { message:'Photo uploaded successfully' , type: 'success' });
  } catch (error) {
    res.render('admin/upload-photo', { message:'An error occured', type:'warning' });
  }
});


/** Photos */
router.get('/photos', async (req, res, next) => {
  try {
    const photos = await Photo.findAll({ order : [['id','desc']]});
    res.render('admin/photos', { photos });
  } catch (error) {
    res.render('admin/photos', { photos:[] });
  }
});



module.exports = router;
