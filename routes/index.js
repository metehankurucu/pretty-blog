var express = require('express');
var router = express.Router();
const { Post, sequelize, Admin, Sequelize, Comment } =  require('../helpers/database');
const config = require('../config');


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where:{
        status:1
      },
      attributes: [
        'id',
        'title',
        'content',
        'thumbnail',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y'), 'createdAt']
      ],
      order:[ [ 'id', 'DESC'] ],
      offset:0,
      limit:6
    });
    const mostReads = await Post.findAll({
      where:{
        status:1
      },
      attributes: [
        'id',
        'title',
        'content',
        'thumbnail',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y'), 'createdAt']
      ],
      order:[ [ 'views', 'DESC'] ],
      offset:0,
      limit:4
    });

    res.render('index', { posts, mostReads, config });
  } catch (error) {
    console.log('Error in index ',error);
    res.render('index', { posts:[], mostReads:[], config });
  }
});

/* GET about page. */
router.get('/about', async (req, res, next) => {
  try {
    const info = await Admin.findOne({ where:{ status:1 } });

    const contact = JSON.parse(info.contact);
    const contacts = [];

    const icons = {
      instagram:'fab fa-instagram',
      twitter:'fab fa-twitter',
      github:'fab fa-github',
      website:'fas fa-globe',
      phone:'fas fa-phone',
      email:'fas fa-envelope',
      youtube:'fab fa-youtube',
      linkedin:'fab fa-linkedin'
    };

    for (const key in contact) {
      if (contact.hasOwnProperty(key)) {
        const element = contact[key];
        if(element !== ''){
          contacts.push({ platform:key, url:element, icon:icons[key] });
        }
      }
    }
    res.render('author',{ info, contacts, config });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

/** All Posts */
router.get('/posts', async (req, res, next) => {
  try {
    let { page, query } = req.query;
    let currentPage = page && Number(page) >= 0 ? Number(page) : 0;
    const perPage = 6;
    let previous,next;

    let where = { status: 1 };

    if(query){
      where.title = {
        [Sequelize.Op.like]: '%' + query + '%'
      }
    }

    const posts = await Post.findAll(
      {
        where,
        attributes: [
          'id',
          'title',
          'content',
          'thumbnail',
          [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y'), 'createdAt']
        ],
        order:[ [ 'id', 'DESC'] ],
        offset:perPage * currentPage,
        limit:perPage
      }
    );
  
    if(posts.length == 0){
      res.render('posts', { posts:[], previous:false, next:false, config  });
    }else{
      next = posts.length == perPage ? currentPage + 1 : false;
      previous = currentPage <= 0 ? false : currentPage - 1;
      res.render('posts', { posts , previous, next, config  });
    }
  } catch (error) {
    console.log(error);
    res.render('posts', { posts:[], previous:false, next:false, config  });
  }
});

/** Post */
router.get('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      where:{ id },
      attributes: [
        'id',
        'title',
        'content',
        'thumbnail',
        'views',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y'), 'createdAt']
      ],
    });

    const updateViews = await Post.update({ views: Number(post.views) + 1 }, { where:{ id } });

    const more = await Post.findAll({
      where:{
        status:1
      },
      attributes: [
        'id',
        'title',
        'content',
        'thumbnail',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y'), 'createdAt']
      ],
      order: Sequelize.literal('rand()'),
      limit:3
    });

    const comments = await Comment.findAll({
      where:{
        post_id:id
      },
      attributes: [
        'id',
        'comment',
        'name',
        'reply',
        'replied_name',
        'like',
        'dislike',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y %H:%m'), 'createdAt']
        // [sequelize.fn('date_format', sequelize.col('replied_date'), '%d.%m.%Y %H:%m'), 'replied_date']
      ],
      order:[ [ 'id', 'DESC'] ],
    });
    res.render('post', { post, more, config, comments, commentCount: comments.length  });
  } catch (error) {
    console.log(error);
    res.render('post', { post:{ title:'', thumbnail:'', content:'' }, more:[], config, comments: [], commentCount: 0  });
  }
});


/** POST add commment */
router.post('/comments',async (req, res, next) => {
  try {
    console.log(req.body);
    const result = await Comment.create(req.body);
    res.redirect('/posts/' + req.body.post_id + '#comments');
  } catch (error) {
    console.log('Error on comment[post]', error);
    res.redirect('/');
  }
});

/** Like Comment */
router.get('/comments/like/:id',async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findOne({ where:{ id } });

    const like = await Comment.update({ like: Number(comment.like) + 1 }, { where:{ id } });
    
    res.redirect('/posts/' + comment.post_id + '#comments');
  } catch (error) {
    console.log('Error on comment[post]', error);
    res.redirect('/');
  }
});

/** Dislike Comment */
router.get('/comments/dislike/:id',async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findOne({ where:{ id } });

    const dislike = await Comment.update({ dislike: Number(comment.dislike) + 1 }, { where:{ id } });
    
    res.redirect('/posts/' + comment.post_id + '#comments');
  } catch (error) {
    console.log('Error on dislike', error);
    res.redirect('/');
  }
});

module.exports = router;
