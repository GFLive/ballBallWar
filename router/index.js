const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const User = require('../modules/user')

// 创建路由
const router = express.Router()
// router.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By",' 3.2.1')
//   if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
//   else  next();
// });

// 使用bodyParser
router.use(bodyParser.urlencoded({ extended: false }));

// 使用session
router.use(session({
  // 掩码
  secret: 'Bender',
  resave: false,
  saveUninitialized: true
}))

// 配置路由
router.get('/', (req, res) => {
  if (req.session.user) {
    res.render('index.html', {
      user: req.session.user
    })
  } else {
    res.redirect('/login')
  }
})

router.get('/login', (req, res) => {
  res.render('login.html')
})
router.post('/login', (req, res) => {
  // 明码存储
  let username = req.body.username
  let password = req.body.password
  
  User.findOne({
    username,
    password
  }).then(user => {
    if (!user) {
      res.status(200).json({
        err: 1,
        msg: '用户名或密码错误'
      })
    } else {
      // 登录成功    1 天过期
      req.session.user = user
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 1

      res.status(200).json({
        err: 0,
        msg: '登录成功'
      })
    }
  })
})

router.get('/register', (req, res) => {
  res.render('register.html')
})
router.post('/register', (req, res) => {
  let username = req.body.username
  let password = req.body.password

  if (!username || !password) {
    res.status(200).json({
      err: 1,
      msg: '用户名或密码为空'
    })
  }

  User.findOne({
    username
  }).then(user => {
    if (!user) {
      new User({
        username, 
        password
      }).save(() => {
        req.session.user = user
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 1

        res.status(200).json({
          err: 0,
          msg: '注册成功'
        })
      })
    } else {
      res.status(200).json({
        err: 1,
        msg: '用户名已存在'
      })
    }
  })
})

// 导出
module.exports = router