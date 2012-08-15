// From http://async5.org/audiodata/examples/piano.html

/**
 * Basic audio destination. (Mono output)
 * @constructor
 * @param {Number}   sampleRate   The sound data sample rate.
 * @param {Function} readFn       The callback function to get the sound data.
 */
function AudioDataDestination(sampleRate, readFn) {
  // Initialize the audio output.
  var audio = new Audio();
  if(!(audio.mozSetup instanceof Function)) {
    alert("Audio Data API is not supported");
  }
  audio.mozSetup(1, sampleRate);

  var currentWritePosition = 0;
  var prebufferSize = sampleRate * 0.250; // buffer 250ms
  var tail = null;

  // The function called with regular interval to populate
  // the audio output buffer.
  setInterval(function() {
    var written;
    // Check if some data was not written in previous attempts.
    if(tail) {
      written = audio.mozWriteAudio(tail);
      currentWritePosition += written;
      if(written < tail.length) {
        // Not all the data was written, saving the tail...
        tail = tail.slice(written);
        return; // ... and exit the function.
      }
      tail = null;
    }

    // Check if we need add some data to the audio output.
    var currentPosition = audio.mozCurrentSampleOffset();
    var available = currentPosition + prebufferSize - currentWritePosition;
    if(available > 0) {
      // Request some sound data from the callback function.
      var soundData = new Float32Array(Math.floor(available));
      readFn(soundData);

      // Writting the data.
      written = audio.mozWriteAudio(soundData);
      if(written < soundData.length) {
        // Not all the data was written, saving the tail.
        tail = soundData.slice(written);
      }
      currentWritePosition += written;
    }
  }, 10);
}

// Control and generate the sound.

var frequency = 0, currentSoundSample;
var sampleRate = 44100;

function requestSoundData(soundData) {
  if (!frequency) {
    return; // no sound selected
  }

  var k = 2* Math.PI * frequency / sampleRate;
  for (var i=0, size=soundData.length; i<size; i++) {
    soundData[i] = Math.sin(k * currentSoundSample++);
  }
}

var audioDestination = new AudioDataDestination(sampleRate, requestSoundData);

function play(frequency_) {
  currentSoundSample = 0;
  frequency = frequency_;
}

function stop() {
  frequency = 0;
}
