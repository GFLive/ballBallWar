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
const delayed = 5
const users = []  // 用户大厅数量
const players = []  // 玩家数量
const maxFoods = 2000 // 最大食物数量
const entity = {  // 实体对象
  players: [],  // 玩家
  foods: []    // 食物
}

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
    // 建立连接
  const user = socket.request.session.user
  if (!user) return ;

  if (socket.request.session.gameState === store.WAITSTATE) {
    // 添加新用户
    if (!users.find(item => item.username === user.username)) {
      delete user.password
      delete user.__v
      delete user._id
      users.push(user)
      io.emit('updateUsers', users)
      io.emit('updatePlayers', players)
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
      io.emit('updatePlayers', players)
      console.log('连接数 : ', users.length)
    })
  } else if (socket.request.session.gameState === store.GAMESTATE) {
    // 游戏连接
    // 添加新用户
    if (!players.find(item => item.username === user.username)) {
      delete user.password
      delete user.__v
      delete user._id
      players.push(user)
      io.emit('updatePlayers', players)
      console.log('游戏用户 : ', players.length)
    }

    // 断开连接
    socket.on('disconnect', () => {
      let index = players.findIndex(item => item.username === user.username)
      if (index !== -1) {
        players.splice(index, 1)
      } else {
        console.log('异常错误')
      }

      io.emit('updatePlayers', players)
      console.log('游戏用户 : ', players.length)
    })

    // 游戏逻辑相关
    // 发送地图数据
    socket.emit('sendMapMessage', {
      width: store.mapWidth,
      height: store.mapHeight
    })

    let username = socket.request.session.user.username
    let player = entity.players.find(item => item.name === username)
    if (!player) {
      let colors = ["#468966", "#FFF0A5", "#FFB03B", "#B64926", "#8E2800", "white", "blue", "tomato", "red", "yellow"]

      player = {
        radius: store.playerRaiuds,
        color: colors[parseInt(Math.random() * colors.length)],
        name: user.username,
        speed: store.playerSpeed
      }
      if (player.name === '斌斌') {
        player.radius = 17
      }

      player.x = parseInt(Math.random() * (store.mapWidth - store.playerRaiuds * 2) + store.playerRaiuds)
      player.y = parseInt(Math.random() * (store.mapHeight - store.playerRaiuds * 2) + store.playerRaiuds)

      entity.players.push(player)
    }

    // 发送自身位置
    socket.emit('updatePlayerMessage', player)

    // 接受自身位置
    socket.on('sendPlayerMessage', data => {
      for (let key in data) {
        player[key] = data[key]
      }
    })
  }
})

// 定时更新
let globalTimer = setInterval(() => {
  io.emit('updateActivePlayers', entity.players)
}, delayed)

server.listen(PORT, () => console.log('server is running in ' + PORT))