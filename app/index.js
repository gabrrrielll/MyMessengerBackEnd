const express = require('express')
const cors = require('cors');
const parser = require('body-parser');

const CONFIG = require('./config')
const routes = require('./routes/index')

const app = express()


// ***********  test  ************

//var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

/*
app.get('/', function(req, res){
  res.sendFile(__dirname + '/routes/index.html');
});
 io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
    });
  }); */
/*   app.get("/", (req, res) => {
    res.send({ response: "I am alive" }).status(200);
  }); */

/*   io.on("connection", socket => {
    console.log("New client connected", socket.id), 
    //setInterval( () => getApiAndEmit(socket), 10000  );
    socket.on("disconnect", () => console.log("Client disconnected"));
  });  */

  const getApiAndEmit = socket => {
    var time = Date.now();
    socket.emit("FromAPI", time); // Emitting a new message. It will be consumed by the client
     
      console.log("S-a apelat functia la timpul: ", time )
    //return time;
  };

 http.listen(4000, function(){
    console.log('listening on *:4000');
  });  
//************** finish test **************


app.use(cors());

app.use(parser.json())

app.use(routes);

//app.listen(CONFIG.PORT, () => console.log("Server stared on " + CONFIG.PORT))