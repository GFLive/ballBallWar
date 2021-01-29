$(() => {
  let socket = io()
  
  // global
  const doublePI = Math.PI * 2
  const gameMap = {}  // 地图对象
  const delayed = 5
  let player = {}  // 玩家对象
  // const updateCnts =  1  // 几轮更新数据
  const dir = [false, false, false, false]  // 上下左右
  const dirMap = {
    w: 0,
    s: 1,
    a: 2,
    d: 3
  }
  let players = [] // 玩家数组
  let foods = [] // 食物数组


  // 初始化
  // canvas相关
  const canvas = $('#canvas')[0]
  const ctx = canvas.getContext('2d')
  socket.on('sendMapMessage', data => {
    gameMap.width = data.width
    gameMap.height = data.height

    $('header').css({
      width: $('#show').width(),
      display: 'flex'
    })
    canvas.width = gameMap.width
    canvas.height = gameMap.height
    canvas.style.display = 'block'
  })


  // 主入口
  let requestId = null
  function main () {
    // 渲染实体
    render()

    // 移动玩家
    let offsetX = (dir[dirMap['d']] - dir[dirMap['a']]) * player.speed
    let offsetY = (dir[dirMap['s']] - dir[dirMap['w']]) * player.speed
    player.x += offsetX
    player.y += offsetY

    // 越界
    // let limit = player.radius
    // if ((player.x < limit || player.x > gameMap.width - limit) && (player.y < limit || player.y > gameMap.height - limit)) {
    //   limit = player.radius * Math.sin(Math.PI * 0.25)
    // }
    let limit = player.radius * Math.sin(Math.PI * 0.25)
    if (player.x < limit) player.x = limit
    else if (player.x > gameMap.width - limit) player.x = gameMap.width - limit
    if (player.y < limit) player.y = limit
    else if (player.y > gameMap.height - limit) player.y = gameMap.height - limit
    socket.emit('sendPlayerMessage', player)

    // 碰撞检测
    collisionPlayerAndFoods()
    
    requestId = requestAnimationFrame(main)
  }

  // 定时发送玩家消息
  let globalTimer = setInterval(() => {
    // socket.emit('sendPlayerMessage', player)
  }, delayed)

  // document 注册按键事件
  $(document).on('keydown', e => {
    if (dirMap[e.key] !== undefined) {
      dir[dirMap[e.key]] = true
    }
  })

  $(document).on('keyup', e => {
    if (dirMap[e.key] !== undefined) {
      dir[dirMap[e.key]] = false
    }
  })
  
  // let lastTransX
  // let lastTransY
  function render () {
    ctx.save()

    ctx.clearRect(0, 0, gameMap.width, gameMap.height)
    let show = $('#show')
    let transX = show.width() * 0.5 - player.x
    let transY = show.height() * 0.5 - player.y

    // if (lastTransX !== undefined && lastTransY !== undefined) {
    //   while (Math.abs(Math.abs(lastTransX) - Math.abs(transX)) > cameraSpeed) {
    //     if (lastTransX < transX) transX -= cameraSpeed
    //     else transX += cameraSpeed
    //   }
    //   while (Math.abs(Math.abs(lastTransY) - Math.abs(transY)) > cameraSpeed) {
    //     if (lastTransY < transY) transY -= cameraSpeed
    //     else transY += cameraSpeed
    //   }
    // }
    // lastTransX = transX
    // lastTransY = transY

    ctx.translate(transX, transY)
    ctx.fillStyle = '#3a4a5a'
    ctx.fillRect(0, 0, gameMap.width, gameMap.height)

    // 渲染食物
    for (let i = 0, len = foods.length; i < len; i++) {
      let food = foods[i]

      if (food === undefined) continue ;
      ctx.beginPath()
      ctx.fillStyle  = food.color
      ctx.arc(food.x, food.y, food.radius, 0, doublePI)
      ctx.fill()
    }

    // 渲染玩家
    let bt = null
    for (let i = 0, len = players.length; i < len; i++) {
      if (players[i].name === player.name) {
        player.radius = players[i].radius
      }
      if (players[i].name === 'Bytwo') {
        bt = players[i]
        // ctx.beginPath() 
        // // 创建线性渐变
        // let grd = ctx.createRadialGradient(players[i].x, players[i].y, 0, players[i].x, players[i].y, players[i].radius)
        // grd.addColorStop(0, "skyblue");
        // grd.addColorStop(0.4, "white");
        // grd.addColorStop(1, "pink"); 
        // // 填充渐变
        // ctx.fillStyle = grd;
        // ctx.arc(players[i].x, players[i].y, players[i].radius, 0, doublePI)
        // ctx.fill()

        // let nums = parseInt(Math.random() * 20)
        // for (let j = 0; j < nums; j++) {
        //   ctx.beginPath()
        //   ctx.fillStyle = 'aqua'
        //   let x = players[i].x + (players[i].radius + Math.random() * players[i].radius) * [-1, 1][parseInt(Math.random() * 2)]
        //   let y = players[i].y + (players[i].radius + Math.random() * players[i].radius) * [-1, 1][parseInt(Math.random() * 2)]
        //   ctx.arc(x, y, parseInt(Math.random() * players[i].radius * 0.2), 0, doublePI)
        //   ctx.fill()
        // }
      } else {
        ctx.beginPath()
        ctx.fillStyle = players[i].color
        ctx.arc(players[i].x, players[i].y, players[i].radius, 0, doublePI)
        ctx.fill()
      }
    }

    if (bt) {
      // 绘制bt
      ctx.beginPath() 
      // 创建线性渐变
      let grd = ctx.createRadialGradient(bt.x, bt.y, 0, bt.x, bt.y, bt.radius)
      grd.addColorStop(0, "skyblue");
      grd.addColorStop(0.4, "white");
      grd.addColorStop(1, "pink"); 
      // 填充渐变
      ctx.fillStyle = grd;
      ctx.arc(bt.x, bt.y, bt.radius, 0, doublePI)
      ctx.fill()
      let nums = parseInt(Math.random() * 20)
      for (let j = 0; j < nums; j++) {
        ctx.beginPath()
        ctx.fillStyle = 'aqua'
        let x = bt.x + (bt.radius + Math.random() * bt.radius) * [-1, 1][parseInt(Math.random() * 2)]
        let y = bt.y + (bt.radius + Math.random() * bt.radius) * [-1, 1][parseInt(Math.random() * 2)]
        ctx.arc(x, y, parseInt(Math.random() * bt.radius * 0.2), 0, doublePI)
        ctx.fill()
      }
    }

    ctx.restore()
  }

  function collisionPlayerAndFoods () {
    for (let i = 0, len = foods.length; i < len; i++) {
      let food = foods[i]
      if (food === undefined) continue ;

      if (distance(food.x, food.y, player.x, player.y) < Math.abs(player.radius - food.radius)) {
        food.isDead = true
      }
    }
    socket.emit('sendFoods', {
      player,
      foods
    })
  }

  function distance (x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  }

  // socket
  socket.on('updateUsers', data => {
    $('.left span').text(data.length)
  })

  socket.on('updatePlayers', data => {
    $('.right span').text(data.length)
  })

  // 游戏逻辑
  socket.on('updatePlayerMessage', data => {
    for (let key in data) {
      player[key] = data[key]
    }
    
    cancelAnimationFrame(requestId)
    requestId = requestAnimationFrame(main)
  })

  socket.on('updateActivePlayers', data => {
    players = data
    players.sort((a, b) => a.radius - b.radius)

    // cancelAnimationFrame(requestId)
    // requestId = requestAnimationFrame(main)
  })

  socket.on('updateFoods', data => {
    foods = data

    // cancelAnimationFrame(requestId)
    // requestId = requestAnimationFrame(main)
  })
})