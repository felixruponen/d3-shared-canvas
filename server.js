
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3300);


app.use("/", express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendfile('./public/index.html');
})

var paths_data = [];

io.sockets.on('connection', function (socket) {
   
  socket.emit('clientConnect', paths_data);

  socket.on('userConnect', function (data) {
      
      paths_data.push(data);

      socket.emit('userConnect', paths_data);
      socket.broadcast.emit('newUser', data);
  });

  socket.on('line', function(data){
    paths_data.forEach(function(element, i){

        if(element.userName === data.userName){
          console.log('line recieved!');
          element.path.push(data.data);
          socket.broadcast.emit(data.type, data);
        }

    });
  });

});





