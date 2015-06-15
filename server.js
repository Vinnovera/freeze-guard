var
	express      = require('express'),
	http         = require('http'),
	path         = require('path'),
	socketio     = require('socket.io'),
	config       = require('./config');

var
	app          = express(),
	server       = http.createServer(app),
	io           = socketio(server);

app.set('port', process.env.PORT || config.expressPort);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), function() {
	console.log('Server listening on port ' + app.get('port'));
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('signal', function(msg){
		console.log('signal: ' + msg);

		io.emit('update', msg);
	});
});
