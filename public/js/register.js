$(() => {
  $('#register').on('submit', function (e) {
    e.preventDefault()
    let username = $('.username').val().trim()
    let password = $('.password').val().trim()

    $.ajax({
      url: ip + '/register',
      type: 'post',
      data: {
        username,
        password
      },
      success: data => {
        if (data.err) {
          // 暂时这么处理了
          alert(data.msg)
        } else {
          // 跳转
          location.href = '/'
        }
      }
    })
  })
})