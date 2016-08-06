var express = require('express'),
    News=require('../models/news.js'),
    User=require('../models/user.js');
;

var router = express.Router();
//手机端路由
router.get('/', function(req, res, next) {
  News.get("推荐",function (err,news) {
    if (err) {
      news=[];
    }
    res.render('index', {
      news: news
    });
  });
});

router.get('/u/:category', function(req, res, next) {
  News.get(req.params.category,function (err,news) {
    if (err) {
      news=[];
    }
    res.render('index', {
      news: news
    });
  });
});



//PC端后台路由
//登录
router.get('/admin/login', checkNotLogin);
router.get('/admin/login', function (req, res) {
  res.render('loginAdmin', {
    user: req.session.user,
    error: req.flash('error').toString()
  });
});

router.post('/admin/login', checkNotLogin);
router.post('/admin/login', function (req, res) {
  var name =req.body.name,
      password = req.body.password;
  //检查用户是否存在
  User.get(name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/admin/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!');
      return res.redirect('/admin/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    res.redirect('/admin');//登陆成功后跳转到主页
  });
});
//退出
router.get('/admin/logout', checkLogin);
router.get('/admin/logout', function (req, res) {
  req.session.user = null;
  res.redirect('/admin/login');//登出成功后跳转到主页
});

//后台首页
router.get('/admin',checkLogin);
router.get('/admin', function(req, res, next) {
    res.render('indexAdmin', {
      user: req.session.user
    });

});

//添加新闻信息
router.get('/admin/add', checkLogin);
router.get('/admin/add', function(req, res, next) {
  res.render('addAdmin', {
    user: req.session.user,
    error: req.flash('error').toString()
  });
});

router.post('/admin/add', checkLogin);
router.post('/admin/add', function (req, res) {
  var news = new News({
    category:req.body.category,
    title:req.body.title,
    label:req.body.label,
    img:req.body.img
  });
  news.save(function (err) {
    if (err) {
      req.flash('error', err);
    }
    req.flash('success', '添加成功!');
    res.redirect('/admin/list');//发表成功跳转到主页
  });
});


//新闻列表
router.get('/admin/list',checkLogin);
router.get('/admin/list', function(req, res, next) {
  News.get(null,function (err,news) {
    if (err) {
      news=[];
    }

    res.render('listAdmin', {
      user: req.session.user,
      news: news,
      success: req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

//删除一条新闻
router.get('/admin/list/remove/:_id', checkLogin);
router.get('/admin/list/remove/:_id', function (req, res) {
  News.remove( req.params._id, function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', '删除成功!');
    res.redirect('/admin/list');
  });
});

//  跳转到编辑页面
router.get('/admin/list/edit/:_id', checkLogin);
router.get('/admin/list/edit/:_id', function (req, res) {
  News.getOne( req.params._id, function (err, news) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    res.render('editAdmin', {
      news: news,
      user: req.session.user
    });
  });
});
//提交编辑内容
router.post('/admin/list/edit/:_id', checkLogin);
router.post('/admin/list/edit/:_id', function (req, res) {
  var news = new News({
    category:req.body.category,
    title:req.body.title,
    label:req.body.label,
    img:req.body.img
  });
  console.log(news.title);
  News.update(req.params._id,news,function (err){
    if (err) {
      req.flash('error','修改失败!');
      return res.redirect('/admin/list/');//出错！返回
    }
    req.flash('success', '修改成功!');
    res.redirect('/admin/list/');//成功！
  });
});

//检查是否登录
function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/admin/login');
  }
  next();
};
function checkNotLogin(req, res, next) {

  if (req.session.user) {
    req.flash('error', '已登录!');
    return res.redirect('back');//返回之前的页面
  }
  next();
};


 module.exports = router;
