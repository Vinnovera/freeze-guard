(function() {

	var socket = io();

	var output = document.getElementById('output');

	socket.on('update', function(msg){
		output.appendChild(document.createTextNode(msg + '\n'));
	});

})();
