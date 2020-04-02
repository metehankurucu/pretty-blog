var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Post, Photo, Comment } =  require('../helpers/database');
const config = require('../config');
const fs = require('fs');
// const nodemailer = require("nodemailer");

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
  res.render('admin/login');
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
            status: user.status,
            name:user.name,
            thumbnail:user.thumbnail
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
router.get('/',async (req, res, next) => {
  try {
    let views = 0;
    const posts = await Post.findAll();
    for (const post of posts) {
      views += Number(post.views);
    }
    res.render('admin/index', { admin:{ ...req.decoded, logo:config.logo },  stat:{post:posts.length.toString(), views:views.toString()} });
  } catch (error) {
    res.render('admin/index', { admin:{ ...req.decoded, logo:config.logo }, stat:{post:'0',views:'0'} });
  }
});


/** Create Post - Get Method */
router.get('/add-post', function(req, res, next) {
  res.render('admin/addPost', { admin:{ ...req.decoded, logo:config.logo } });

});


/** Post Page */
router.get('/post/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findOne({ where:{ id: postId} });
    res.render('admin/post', { post, admin:{ ...req.decoded, logo:config.logo } });
  } catch (error) {
    console.log(error);
    res.render('admin/post', { admin:{ ...req.decoded, logo:config.logo } });
  }
});


/** Post Update */
router.post('/post/:id', async (req, res, next) => {
  const postId = req.params.id;
  try {
    const { title, thumbnail, content } = req.body;
    const result = await Post.update({ title, thumbnail, content },{ where:{ id: postId }});
      
    const post = await Post.findOne({ where:{ id: postId } });
    res.render('admin/post', { post, admin:{ ...req.decoded, logo:config.logo } });
  } catch (error) {
    console.log(error);
    res.render('admin/post', { admin:{ ...req.decoded, logo:config.logo } });
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
    const result = await Post.destroy({ where:{ id: postId } });
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
  res.render('admin/addPost', { admin:{ ...req.decoded, logo:config.logo } });
});


/** Posts */
router.get('/posts', async (req, res, next) => {
  try {
    const posts = await Post.findAll({ order:[ [ 'id', 'DESC'] ] });
    res.render('admin/posts', { posts, admin:{ ...req.decoded, logo:config.logo } });
  } catch (error) {
    res.render('admin/posts', { posts:[], admin:{ ...req.decoded, logo:config.logo }});
  }
});


/** Upload Photo Page */
router.get('/upload-photo', function(req, res, next) {
  res.render('admin/upload-photo', { admin:{ ...req.decoded, logo:config.logo } });
});

/** Upload Photo Post */
router.post('/upload-photo',upload.single('photo'), async (req, res, next) => {
  try {
    const url = config.BASE_URL + req.file.path;
    const result = await Photo.create({ url });
    res.render('admin/upload-photo', { message:'Photo uploaded successfully' , type: 'success', admin:{ ...req.decoded, logo:config.logo }});
  } catch (error) {
    res.render('admin/upload-photo', { message:'An error occured', type:'warning', admin:{ ...req.decoded, logo:config.logo } });
  }
});

/** Delete Photo */
router.get('/delete-photo', async (req, res, next) => {
  try {
    const { url, id } = req.query;
    const path = url.split(config.BASE_URL)[1];
    fs.unlink(path, (err) => {
      if (!err){
        Photo.destroy({ where:{ id } });
      }
    });
    res.redirect('/admin/photos');
  } catch (error) {
    console.log(error);
    res.redirect('/admin/photos');
  }
});


/** Photos */
router.get('/photos', async (req, res, next) => {
  try {
    const photos = await Photo.findAll({ order : [['id','desc']]});
    res.render('admin/photos', { photos, admin:{ ...req.decoded, logo:config.logo } });
  } catch (error) {
    res.render('admin/photos', { photos:[], admin:{ ...req.decoded, logo:config.logo } });
  }
});


/** About */
router.get('/about', async (req, res, next) => {
  try {
    const { id } = req.decoded;

    const info = await Admin.findOne({ where: { id }});
    info.contact = JSON.parse(info.contact);

    res.render('admin/about', { info, admin:{ ...req.decoded, logo:config.logo } });
  } catch (error) {
    res.render('admin/about', {message:'An error occured' , type: 'danger', admin:{ ...req.decoded, logo:config.logo }});
  }
});

/** About Update  */
router.post('/about', async (req, res, next) => {
  try {
    const { id } = req.decoded;
    const { name, about, thumbnail, instagram, twitter, linkedin, youtube, github, website, email, phone } = req.body;
    const contact = { instagram, twitter, linkedin, youtube, github, website, email, phone }
    
    const result = await Admin.update(
      { name, about, thumbnail, contact:JSON.stringify(contact) },
      { where : { id } } 
    );

    const info = await Admin.findOne({ where: { id }});
    info.contact = JSON.parse(info.contact);

    res.render('admin/about', { info, message:'Updated successfully' , type: 'success', admin:{ ...req.decoded, logo:config.logo } });
  } catch (error) {
    res.render('admin/about', { message:'An error occured' , type: 'danger', admin:{ ...req.decoded, logo:config.logo } });
  }
});


/*  For forgot password action, edit this
router.get('/forgot-password', function(req, res, next) {
  res.render('admin/forgot-password');
});


router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    let user = await Admin.findOne({ where: { email } });

    if(!user){
      res.render('admin/forgot-password', { message: 'Admin not found' });
    }else{
      let testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass // generated ethereal password
        }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "mktr192@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      res.render('admin/forgot-password', { message: 'Check Your Email' });
    }
  } catch (error) {
    res.render('admin/forgot-password', { message: 'An error occured' });

  }
});
*/


/** Comments */
router.get('/comments', async (req, res, next) => {
  try {
    let { page } = req.query;
    let currentPage = page && Number(page) >= 0 ? Number(page) : 0;
    const perPage = 30;
    let previous,next;

    const comments = await Comment.findAll(
      {
        order:[ [ 'id', 'DESC'] ],
        offset:perPage * currentPage,
        limit:perPage
      }
    );
    if(comments.length == 0){
      res.render('admin/comments', { comments:[], previous:false, next:false, admin:{ ...req.decoded, logo:config.logo }  });
    }else{
      next = comments.length == perPage ? currentPage + 1 : false;
      previous = currentPage <= 0 ? false : currentPage - 1;
      res.render('admin/comments', { comments , previous, next, admin:{ ...req.decoded, logo:config.logo } });
    }
  } catch (error) {
    console.log(error);
    res.render('admin/comments', { comments:[], previous:false, next:false, admin:{ ...req.decoded, logo:config.logo }  });
  }
});


/** GET Comment  */
router.get('/comments/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findOne({ where:{ id } });
    const post = await Post.findOne({ where:{ id:comment.post_id } });
    res.render('admin/comment', { admin:{ ...req.decoded, logo:config.logo }, comment, post });
  } catch (error) {
    console.log(error);
    res.redirect('admin/comment', { admin:{ ...req.decoded, logo:config.logo }, message:'An error occured', type:'danger', comment:{}});
  }
});


/** POST Comment (reply)  */
router.post('/comments/:id', async (req, res, next) => {
  const { id } = req.params;
  const { reply } = req.body;
  try {

    const replied_date = new Date();

    const params = { reply, replied_date, replied_name:req.decoded.name };

    console.log(params);
    
    const update = await Comment.update(params, { where:{ id } });

    const comment = await Comment.findOne({ where:{ id } });
    const post = await Post.findOne({ where:{ id:comment.post_id } });

    res.render('admin/comment', { admin:{ ...req.decoded, logo:config.logo }, comment, post, message:'Reply Saved!', type:'success' });
  } catch (error) {
    console.log(error);
    res.render('admin/comment', { admin:{ ...req.decoded, logo:config.logo }, message:'An error occured', type:'danger', comment:{} });
  }
});


module.exports = router;
