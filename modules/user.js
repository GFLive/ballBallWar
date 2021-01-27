const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost/networkGame', { 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
// 会被攻击

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  
  password: {
    type: String,
    required: true
  },

  avatar: {
    type: String,
    default: '/public/img/avatar-default.png'
  },
})

module.exports = mongoose.model('User', userSchema)
