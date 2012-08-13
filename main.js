(function(window, document, _){

  var DEFAULT_CONF = {
    players: 4,
    verticalMargin: 40,
    lapDistance: 80,
    topMargin: 100,
    colors: ['#f00', '#0f0', '#00f', '#f0f'],
    bpm: 90
  };

  // Resize the canvas
  function canvResize(canvas, window, callback) {
    window.onresize = function(){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      callback();
    };
    window.onresize();
  }

  // Random integer
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Round with digits
  function roundToDigits(num, digits) {
    if (!digits) {
      return Math.round(num);
    }
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  // Processing map function
  function map(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

  // Returns a "Character" object
  function getCharacter(position) {
    return {
      position: position
    };
  }

  // Returns a "Path" object
  function getPath() {
    var levels = [1,2,3,4,5,6,7];
    return {
      steps: [],
      addSteps: function(stepsCount) {
        var lastStep = this.steps.length? this.steps[this.steps.length-1] : 0,
            currentLevels;
        for (var i = 0; i < stepsCount; i++) {
          currentLevels = _.without(levels, lastStep);
          lastStep = currentLevels[getRandomInt(0, currentLevels.length-1)];
          this.steps.push(lastStep);
        }
      }
    };
  }

  function start(canvasSelector, conf) {
    var canvas = document.querySelector(canvasSelector),
        ctx = canvas.getContext('2d'),
        path = null,
        grid = null,
        players = [],
        scroll = 0,
        draw = null,
        startTime = Date.now(),
        xProgress = 0;

    conf = _.extend({}, DEFAULT_CONF, conf);

    // Init path
    path = getPath();
    path.addSteps(40);

    // Init players
    for (var i=0; i < conf.players; i++) {
      players.push(getCharacter(i+1,
        path.steps,
        conf.verticalMargin,
        conf.topMargin,
        conf.colors
      ));
    }

    // Draw function
    var lastTime, currentStep;
    draw = function() {

      var yBase,
          debugEachSecond = !lastTime || Date.now() - lastTime > 1000,
          i, j;

      // Time progress
      xProgress = roundToDigits((Date.now() - startTime) / (1000 * 60 / conf.bpm) * conf.lapDistance, 1);
      currentStep = Math.floor(xProgress / conf.lapDistance);

      // Clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Grid
      for (i = 0; i < 7 + (conf.players-1); i++) {
        ctx.beginPath();
        ctx.moveTo(0, (conf.verticalMargin * i) + conf.topMargin + 0.5);
        ctx.lineTo(ctx.canvas.width, (conf.verticalMargin * i) + conf.topMargin + 0.5);
        ctx.strokeStyle = '#eee';
        ctx.stroke();
        ctx.closePath();
      }

      // Path
      for (i = 0; i < conf.players; i++) {
        yBase = conf.topMargin + (conf.verticalMargin * i);

        // Path lines
        ctx.beginPath();
        ctx.moveTo(-xProgress, yBase + (path.steps[0]-1) * conf.verticalMargin + 0.5);
        for (j = 0; j < path.steps.length; j++) {
          ctx.lineTo((j+1) * conf.lapDistance - xProgress, yBase + (path.steps[j+1]-1) * conf.verticalMargin + 0.5);
        }
        ctx.strokeStyle = conf.colors[i];
        ctx.stroke();
        ctx.closePath();

        // Path points
        for (j = 0; j < path.steps.length; j++) {
          ctx.fillStyle = '#333';
          ctx.fillRect(j * conf.lapDistance - xProgress - 2, yBase + (path.steps[j]-1) * conf.verticalMargin - 2 + 0.5, 4, 4);
        }
      }

      // Players
      for (i = 0; i < players.length; i++) {

        yBase = conf.topMargin + (conf.verticalMargin * i);

        ctx.beginPath();
        ctx.arc(0, map(xProgress % conf.lapDistance,
                       0, conf.lapDistance,
                       yBase + (path.steps[currentStep]-1) * conf.verticalMargin,
                       yBase + (path.steps[currentStep+1]-1) * conf.verticalMargin),
                10, 0, Math.PI*2, true);
        ctx.fillStyle = conf.colors[players[i].position-1];
        ctx.fill();
        ctx.closePath();
      }

      // Debug
      if (debugEachSecond) {
        lastTime = Date.now();
      }

      window.requestAnimFrame(draw);
    };

    draw();

    canvResize(canvas, window, function(){
      draw();
    });
  }
  window.taplap = start;
})(this, this.document, this._);
