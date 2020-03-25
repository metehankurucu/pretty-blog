var express = require('express');
var router = express.Router();
const { Post, sequelize } =  require('../helpers/database');


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

    for (const iterator of mostReads) {
      console.log(iterator.createdAt);
    }

    res.render('index', { posts, mostReads });
  } catch (error) {
    console.log('Error in index ',error);
    res.render('index', { posts:[], mostReads:[] });
  }
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('author', { title: 'Hakkımda' });
});


/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'İletişim' });
});


/** All Posts */
router.get('/posts', async (req, res, next) => {
  try {
    let { page } = req.query;
    let currentPage = page && Number(page) >= 0 ? Number(page) : 0;
    const perPage = 6;
    let previous,next;

    const posts = await Post.findAll(
      {
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
        offset:perPage * currentPage,
        limit:perPage
      }
    );
  
    if(posts.length == 0){
      res.redirect('/posts?page=0');
    }else{
      next = posts.length == perPage ? currentPage + 1 : false;
      previous = currentPage <= 0 ? false : currentPage - 1;
      res.render('posts', { posts , previous, next });
    }
  } catch (error) {
    res.render('posts', { posts:[], previous:false, next:false });
  }
});

/** Post */
router.get('/posts/:id', function(req, res, next) {
  console.log('HERE')
  res.render('post', { title: '' });
});

module.exports = router;
