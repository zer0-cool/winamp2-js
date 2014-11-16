/* Helpful wrapper for the native <audio> element */
function Media (audioId) {
    this.context = new(window.AudioContext || window.webkitAudioContext)();
    this.source = false;
    this.buffer = false;
    this.gainNode = this.context.createGain();

    this.callbacks = {
        'timeupdate': function(){},
        'ended': function(){},
        'waiting': function(){},
        'playing': function(){},
    };

    this._position = 0;
    this._playing = false;
}

Media.prototype.loadFileObject = function(file) {
    var reader = new FileReader();

    // Error function for decodeAudioData
    error = function (error) {
        //console.error("failed to decode:", error);
    }

    // Setup the success listener
    reader.onload = function (e) {
        // Decode the target file into an arrayBuffer and pass it to loadBuffer
        this.context.decodeAudioData(e.target.result, this.loadBuffer.bind(this), error);
    }.bind(this);

    // Setup the error listener for onload
    reader.onerror = function (e) {
        //console.error(e);
    };

    this.callbacks.waiting();
    // Read the file
    reader.readAsArrayBuffer(file);
}

Media.prototype.loadBuffer = function(buffer) {
    this.buffer = buffer;
    this._draw();
    this.play();
}

Media.prototype.connect = function() {
    if ( this._playing ) {
        this.pause();
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
}

Media.prototype.play = function(position) {
    this.connect();
    this._position = typeof position !== 'undefined' ? position : this._position;
    this.startTime = this.context.currentTime - this._position;
    this.source.start(0, this._position);
    this._playing = true;
    this.callbacks.playing();
}

Media.prototype.pause = function() {
    this.source.stop(0);
    this.source = null;
    this._position = this.context.currentTime - this.startTime;
    this._playing = false;
}

Media.prototype.stop = function() {
    this.pause()
    this._position = 0;
}

Media.prototype.seek = function(time) {
    if ( this._playing ) {
        this.play(time);
    }
    else {
        this._position = time;
    }
}

Media.prototype.seekToPercentComplete = function(percent) {
    var fraction = percent / 100;
    var seekTime = this.duration() * fraction;
    this.seek(seekTime);
}
Media.prototype.duration = function() {
    return this.buffer.duration;
}

Media.prototype.timeElapsed = function() {
    return this.context.currentTime - this.startTime;
}

Media.prototype.timeRemaining = function() {
    return this.duration() - this.timeElapsed();
}

Media.prototype.percentComplete = function() {
    return (this.timeElapsed() / this.duration()) * 100;
}

// From 0-1
Media.prototype.setVolume = function(volume) {
    this.gainNode.gain.value = volume;
}

Media.prototype.toggleRepeat = function() {
    this.source.loop = true;
    console.log(this.source.loop);
}

Media.prototype._draw = function() {
    if(this._playing) {
        this._updatePosition();
        this.callbacks.timeupdate();
    }
    window.requestAnimationFrame(this._draw.bind(this));
}

Media.prototype._updatePosition = function() {
    this._position = this.context.currentTime - this.startTime;
    if(this._position >= this.buffer.duration) {
        // XXX Why doesn't this get handled automatically?
        if(this.source.loop) {
            this.play(0);
        } else {
            this.stop();
            this.callbacks.ended();
        }
    }
    return this._position;
}

Media.prototype.addEventListener = function(event, callback) {
    this.callbacks[event] = callback;
}
