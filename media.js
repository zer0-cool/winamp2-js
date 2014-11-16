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
    this.loadFileObject = function(file) {
        this.callbacks.waiting();

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

        // Read the file
        reader.readAsArrayBuffer(file);
    }.bind(this)

    this.loadBuffer = function(buffer) {
        this.buffer = buffer;
        this._draw();
        this.play(0);
    }.bind(this)

    this.connect = function() {
        if ( this._playing ) {
            this.pause();
        }
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
    }.bind(this)

    this.play = function(position) {
        this.connect();
        this._position = typeof position !== 'undefined' ? position : this._position;
        this.startTime = this.context.currentTime - this._position;
        this.source.start(0, this._position);
        this._playing = true;
        this.callbacks.playing();
    }.bind(this)

    this.pause = function() {
        this.source.stop(0);
        this.source = null;
        this._position = this.context.currentTime - this.startTime;
        this._playing = false;
    }.bind(this)

    this.stop = function() {
        this.pause()
        this._position = 0;
    }.bind(this)

    this.seek = function(time) {
        if ( this._playing ) {
            this.play(time);
        }
        else {
            this._position = time;
        }
    }.bind(this)

    this.seekToPercentComplete = function(percent) {
        var fraction = percent / 100;
        var seekTime = this.duration() * fraction;
        this.seek(seekTime);
    }.bind(this)
    this.duration = function() {
        return this.buffer.duration;
    }.bind(this)

    this.timeElapsed = function() {
        return this.context.currentTime - this.startTime;
    }.bind(this)

    this.timeRemaining = function() {
        return this.duration() - this.timeElapsed();
    }.bind(this)

    this.percentComplete = function() {
        return (this.timeElapsed() / this.duration()) * 100;
    }.bind(this)

    // From 0-1
    this.setVolume = function(volume) {
        this.gainNode.gain.value = volume;
    }.bind(this)

    this.toggleRepeat = function() {
        this.source.loop = true;
        console.log(this.source.loop);
    }.bind(this)

    this._draw = function() {
        if(this._playing) {
            this._updatePosition();
            this.callbacks.timeupdate();
        }
        window.requestAnimationFrame(this._draw.bind(this));
    }.bind(this)

    this._updatePosition = function() {
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
    }.bind(this)

    this.addEventListener = function(event, callback) {
        this.callbacks[event] = callback;
    }.bind(this)
}



