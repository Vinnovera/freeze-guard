var
	express        = require('express'),
	http           = require('http'),
	path           = require('path'),
	socketio       = require('socket.io'),
	config         = require('./config');

var
	TRESHOLD       = 35,
	COLLECTDELAY   = 1000,
	COOLDOWN       = 10000,
	MAXTHREATLEVEL = 10,
	app            = express(),
	server         = http.createServer(app),
	io             = socketio(server),
	alarmHistory   = [],
	isCollecting   = false;

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

	socket.on('signal', function(msg) {
		if (parseFloat(msg) > TRESHOLD && !isCollecting) {
			console.log('Got signal: ' + msg);
			isCollecting = true;
			setTimeout(function() {
				var newAlarm = {
					value: msg,
					coolDown: function () {
						var that = this;
						setTimeout(function() {
							alarmHistory.splice(alarmHistory.indexOf(that), 1);
							postUpdate();
						}, COOLDOWN);
					}
				};
				alarmHistory.push(newAlarm);
				newAlarm.coolDown();
				isCollecting = false;
				postUpdate();
			}, COLLECTDELAY);
		}
	});
});

function postUpdate () {
	var threatLevel = alarmHistory.length / MAXTHREATLEVEL > 1 ? 1 : alarmHistory.length / MAXTHREATLEVEL;
	io.emit('update', threatLevel);
}
