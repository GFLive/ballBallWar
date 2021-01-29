module.exports = {
  GAMESTATE: 1,
  WAITSTATE: 0,
  
  // 地图宽高
  mapWidth: 1000,
  mapHeight: 600,

  // 玩家基本信息
  playerRaiuds: 100,
  playerSpeed: 5,
  maxPlayerRadius: 350,

  foodCnt: 0,
  distance (x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  }
}

