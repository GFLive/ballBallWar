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
  let players = [] // 其他玩家数组


  // 初始化
  // canvas相关
  const canvas = $('#canvas')[0]
  const ctx = canvas.getContext('2d')
  socket.on('sendMapMessage', data => {
    gameMap.width = data.width
    gameMap.height = data.height

    $('header').css({
      width: gameMap.width,
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
    // socket.emit('sendPlayerMessage', player)

    requestId = requestAnimationFrame(main)
  }

  let globalTimer = setInterval(() => {
    socket.emit('sendPlayerMessage', player)
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
  
  function render () {
    ctx.save()

    ctx.clearRect(0,  0, gameMap.width, gameMap.height)

    // 渲染玩家
    for (let i = 0, len = players.length; i < len; i++) {
      // if (players[i].name === player.name) continue ;
      if (players[i].name === '斌斌') {
        ctx.beginPath() 
        // 创建线性渐变
        let grd = ctx.createRadialGradient(players[i].x, players[i].y, 5, players[i].x, players[i].y, players[i].radius)
        grd.addColorStop(0, "white");
        grd.addColorStop(0, "skyblue");
        grd.addColorStop(1, "pink"); 
        // 填充渐变
        ctx.fillStyle = grd;
        ctx.arc(players[i].x, players[i].y, players[i].radius, 0, doublePI)
        ctx.fill()

        let nums = parseInt(Math.random() * 20)
        for (let j = 0; j < nums; j++) {
          ctx.beginPath()
          ctx.fillStyle = 'aqua'
          let x = players[i].x + (players[i].radius + Math.random() * players[i].radius) * [-1, 1][parseInt(Math.random() * 2)]
          let y = players[i].y + (players[i].radius + Math.random() * players[i].radius) * [-1, 1][parseInt(Math.random() * 2)]
          ctx.arc(x, y, parseInt(Math.random() * 3), 0, doublePI)
          ctx.fill()
        }
      } else {
        ctx.beginPath()
        ctx.fillStyle = players[i].color
        ctx.arc(players[i].x, players[i].y, players[i].radius, 0, doublePI)
        ctx.fill()
      }
    }

    ctx.restore()
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

    cancelAnimationFrame(requestId)
    requestId = requestAnimationFrame(main)
  })
})