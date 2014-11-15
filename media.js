/* Helpful wrapper for the native <audio> element */
function Media (audioId) {
    var context = new(window.AudioContext || window.webkitAudioContext)();
    var source = context.createBufferSource();
    var gainNode = context.createGain();
    gainNode.gain.value = .01;
    source.connect(gainNode);
    gainNode.connect(context.destination);

    /* Properties */
    this.duration = function() {
        //return this.audio.duration;
    }
    this.timeElapsed = function() {
        //return this.audio.currentTime;
    }
    this.timeRemaining = function() {
        //return this.audio.duration - this.audio.currentTime;
    }
    this.percentComplete = function() {
        //return (this.audio.currentTime / this.audio.duration) * 100;
    }

    /* Actions */
    this.previous = function() {
        // Implement this when we support playlists
    }
    this.play = function() {
        source.start(0);
    }
    this.pause = function() {
        //this.audio.pause();
    }
    this.stop = function() {
        //this.audio.pause();
        //this.audio.currentTime = 0;
    }
    this.next = function() {
        // Implement this when we support playlists
    }
    this.toggleRepeat = function() {
        //this.audio.loop = !this.audio.loop;
    }
    this.toggleShuffle = function() {
        // Not implemented
    }

    /* Actions with arguments */
    this.seekToPercentComplete = function(percent) {
        //this.audio.currentTime = this.audio.duration * (percent/100);
    }
    // From 0-1
    this.setVolume = function(volume) {
        //this.audio.volume = volume;
    }
    this.loadFileObject = function(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //console.log(e);
            raw = e.target.result;
            context.decodeAudioData(raw, function (buffer) {
                if (!buffer) {
                    //console.error("failed to decode:", "buffer null");
                    return;
                }
                source.buffer = buffer;
            }, function (error) {
                //console.error("failed to decode:", error);
            });
        };
        reader.onerror = function (e) {
            //console.error(e);
        };
        reader.readAsArrayBuffer(file);
    }

    /* Listeners */
    this.addEventListener = function(event, callback) {
        //this.audio.addEventListener(event, callback);
    }
}
