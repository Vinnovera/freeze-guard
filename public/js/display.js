(function() {

	var socket = io();

	var output = document.getElementById('output');

	socket.on('update', function(msg){
		output.appendChild(document.createTextNode(msg + '\n'));
	});

	var request = new XMLHttpRequest();
	request.open('GET', '/history', true);
	request.onload = function() {
		var data = JSON.parse(request.responseText);

		var categories = [];
		var series = [{
			name: 'Alarms',
			data: []
		}];
		data.forEach(function(d) {
			categories.push(d.time);
			series[0].data.push(d.alarms);
		});

		var chart = new Highcharts.Chart({
			chart: {
				type: 'spline',
				renderTo: 'chart'
			},
			xAxis: {
				categories: categories
			},
			series: series
		});


	};
	request.onerror = function() {
		// There was a connection error of some sort
	};
	request.send();

})();
