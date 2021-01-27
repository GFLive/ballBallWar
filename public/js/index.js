$(() => {
  let socket = io()

  $('.leave').on('click', () => {
    $.ajax({
      url: ip + '/logout',
      type: 'get',
      success: data => {
        if (!data.err) {
          location.href = '/'
        }
      }
    })
  })

  socket.on('updateUsers', data => {
    $('.totalUser span').text(data.length)
  })
})