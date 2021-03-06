(function() {

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	if (navigator.getUserMedia) {
		navigator.getUserMedia({
			audio: true,
			video: false
		}, function (stream) {

			var socket = io();

			var
				audioContext        = new AudioContext(),
				analyser            = audioContext.createAnalyser(),
				microphone          = audioContext.createMediaStreamSource(stream),
				javascriptNode      = audioContext.createScriptProcessor(2048, 1, 1);

			analyser.smoothingTimeConstant = 0.8;
			analyser.fftSize = 1024;

      window.source = audioContext.createMediaStreamSource(stream);
      source.connect(audioContext.destination);

			microphone.connect(analyser);
			analyser.connect(javascriptNode);
			javascriptNode.connect(audioContext.destination);

			javascriptNode.onaudioprocess = function() {
				var array = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				var values = 0;

				var length = array.length;
				for (var i = 0; i < length; i++) {
					values += (array[i]);
				}

				var average = values / length;

				socket.emit('signal', average);
			}

		}, function (err) {
			alert(err.name);
		});
	} else {
		alert('getUserMedia is not supported');
	}

})();
