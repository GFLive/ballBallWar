const express = require('express')
const session = require('express-session')
const path = require('path')
const router = require('./router')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const store = require('./modules/common')

// global
const PORT = 3000
const GAMEPORT = 3333
const users = []  // 用户大厅数量
const players = []  // 玩家数量

// art-template 配置
app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views'))

// 配置静态文件目录
app.use('/public', express.static(path.join(__dirname, './public')))

// 安装路由
// 使用session    配置 io
let sessionMiddleware = session({
  // 掩码
  secret: 'Bender',
  resave: false,
  saveUninitialized: true
})

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware)
app.use(router)

// socket.io 相关
io.on('connection', socket => {
  if (socket.requet.session.gameState === store.WAITSTATE) {
    // 建立连接
    const user = socket.request.session.user
    if (!user) return ;

    // 添加新用户
    if (!users.find(item => item.username === user.username)) {
      users.push(user)
      io.emit('updateUsers', users)
      console.log('连接数 : ', users.length)
    }

    // 断开连接
    socket.on('disconnect', () => {
      let index = users.findIndex(item => item.username === user.username)
      if (index !== -1) {
        users.splice(index, 1)
      } else {
        console.log('异常错误')
      }

      io.emit('updateUsers', users)
      console.log('连接数 : ', users.length)
    })
  } else if (socket.requet.session.gameState === store.GAMESTATE) {
    // 游戏连接
  }
})

server.listen(PORT, () => console.log('server is running in ' + PORT))