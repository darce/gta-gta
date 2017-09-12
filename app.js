'use strict';

var port = process.env.PORT || 4004;
var app =  require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var UUID = require('uuid');
var verbose = true;


// Server setup.
server.listen(port);
console.log('\t -- Express -- listening on port ' + port);

app.get('/', function (req, res) {
    res.sendfile('/index.html', {root: __dirname});
});

// Listen for requests to any file from the server root.
app.get( '/*' , function( req, res, next ) {
    var file = req.params[0];
    if(verbose) console.log('\t -- Express -- file requested : ' + file);
    res.sendfile('/' + file, {root: __dirname});
});

// Socket.IO set up.
io.use(function(socket, next) {
    var handshake = socket.request;
    next();
});

//Socket.io will call this function when a client connects,
//So we can send that client a unique ID we use so we can
//maintain the list of players.
io.sockets.on('connection', function (client) {
    //Generate a new UUID, looks something like
    //5b2ca132-64bd-4513-99da-90e838ca47d1
    //and store this on their socket/connection
    client.userid = UUID();

    //tell the player they connected, giving them their id
    client.emit('onconnected', { id: client.userid } );

    //Useful to know when someone connects
    console.log('\t socket.io:: player ' + client.userid + ' connected');

    //When this client disconnects
    client.on('disconnect', function () {
        //Useful to know when someone disconnects
        console.log('\t socket.io:: client disconnected ' + client.userid );
    }); //client.on disconnect
}); //sio.sockets.on connection