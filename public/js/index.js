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

  $('.join').on('click', () => {
    $.ajax({
      url: ip + '/requestGame',
      type: 'get',
      success: data => {
        location.href = '/gamePage'
      }
    })
  })

  socket.on('updateUsers', data => {
    $('.totalUser span').text(data.length)
  })

  socket.on('updatePlayers', data => {
    $('.activeUser span').text(data.length)
  })
})