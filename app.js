const express = require('express')
const path = require('path')
const router = require('./router')
const app = express()

// global
const PORT = 3000

// art-template 配置
app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views'))

// 配置静态文件目录
app.use('/public', express.static(path.join(__dirname, './public')))

// 安装路由
app.use(router)

app.listen(PORT, () => console.log('server is running in ' + PORT))