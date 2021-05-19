"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mp3cutter = (function () {
	//libPath must end with a slash

	function mp3cutter() {
		var libPath = arguments.length <= 0 || arguments[0] === undefined ? "./lib/" : arguments[0];
		var log = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		_classCallCheck(this, mp3cutter);
		this.libPath = libPath;
		this.log = log;
	}

	_createClass(mp3cutter, [{
		key: "logger",
		value: function logger(message) {
			if (this.log) console.log(message);
		}
	}, {
		key: "cut",
		value: function cut(src, start, end, callback) {
			var _this = this;

			var bitrate = arguments.length <= 4 || arguments[4] === undefined ? 192 : arguments[4];

			if (!src) throw 'Invalid parameters!';

			if (start > end) throw 'Start is bigger than end!';else if (start < 0 || end < 0) throw 'Start or end is negative, cannot process';

			this.start = start;
			this.end = end;
			this.callback = callback;
			this.bitrate = bitrate;

			// Convert blob into ArrayBuffer
			this.audioContext = new AudioContext();
			var r = new Response(src).arrayBuffer();
			r.then(function (buffer) {
				//Convert ArrayBuffer into AudioBuffer
				_this.audioContext.decodeAudioData(buffer).then(function (decodedData) {
					return _this.computeData(decodedData);
				});
			});
		}
	}, {
		key: "computeData",
		value: function computeData(decodedData) {
			this.logger(decodedData);
			//Compute start and end values in secondes
			var computedStart = decodedData.length * this.start / decodedData.duration;
			var computedEnd = decodedData.length * this.end / decodedData.duration;

			//Create a new buffer
			var newBuffer = this.audioContext.createBuffer(decodedData.numberOfChannels, computedEnd - computedStart, decodedData.sampleRate);

			// Copy from old buffer to new with the right slice.
			// At this point, the audio has been cut
			for (var i = 0; i < decodedData.numberOfChannels; i++) {
				newBuffer.copyToChannel(decodedData.getChannelData(i).slice(computedStart, computedEnd), i);
			}

			var source = this.audioContext.createBufferSource();

			// set the buffer in the AudioBufferSourceNode
			source.buffer = newBuffer;
			// connect the AudioBufferSourceNode to the
			// destination so we can hear the sound
			source.connect(this.audioContext.destination);

			// start the source playing
			// source.start();
			const _cb = this.callback;
			function audioBufferToWav(buffer, opt) {
				opt = opt || {}

				var numChannels = buffer.numberOfChannels
				var sampleRate = buffer.sampleRate
				var format = opt.float32 ? 3 : 1
				var bitDepth = format === 3 ? 32 : 16

				var result
				if (numChannels === 2) {
					result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
				} else {
					result = buffer.getChannelData(0)
				}

				var WORKER = new Worker('/assets/js/cutter_worker.js');

				WORKER.postMessage({samples: result, format: format, sampleRate: sampleRate, numChannels: numChannels, bitDepth: bitDepth});

				WORKER.onmessage = (e) => {
					if (e.data.buff) {
						var blob = new window.Blob([new DataView(e.data.buff)], {
							type: 'audio/wav'
						});
						_cb(blob);
					} else if (e.data.error) {
						throw(e.data.error);
					} else {
						throw('Error Worker');
					}
				}
			}
			
			audioBufferToWav(newBuffer);
		}
	}]);

	return mp3cutter;
})();

function interleave (inputL, inputR) {
  var length = inputL.length + inputR.length
  var result = new Float32Array(length)

  var index = 0
  var inputIndex = 0

  while (index < length) {
    result[index++] = inputL[inputIndex]
    result[index++] = inputR[inputIndex]
    inputIndex++
  }
  return result
}
