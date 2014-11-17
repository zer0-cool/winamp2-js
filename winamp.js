// UI and App logic
function Winamp () {
    self = this;
    this.fileManager = FileManager;
    this.media = Media.init();
    this.skinManager = SkinManager;
    this.font = Font;
    this.visualizerStyle = 'oscilloscope';
    this.visualizer = Visualizer.init(document.getElementById('visualizer'));

    this.nodes = {
        'option': document.getElementById('option'),
        'close': document.getElementById('close'),
        'shade': document.getElementById('shade'),
        'position': document.getElementById('position'),
        'fileInput': document.getElementById('file-input'),
        'volumeMessage': document.getElementById('volume-message'),
        'balanceMessage': document.getElementById('balance-message'),
        'positionMessage': document.getElementById('position-message'),
        'songTitle': document.getElementById('song-title'),
        'time': document.getElementById('time'),
        'shadeTime': document.getElementById('shade-time'),
        'visualizer': document.getElementById('visualizer'),
        'previous': document.getElementById('previous'),
        'play': document.getElementById('play'),
        'pause': document.getElementById('pause'),
        'stop': document.getElementById('stop'),
        'next': document.getElementById('next'),
        'eject': document.getElementById('eject'),
        'repeat': document.getElementById('repeat'),
        'shuffle': document.getElementById('shuffle'),
        'volume': document.getElementById('volume'),
        'kbps': document.getElementById('kbps'),
        'khz': document.getElementById('khz'),
        'balance': document.getElementById('balance'),
        'playPause': document.getElementById('play-pause'),
        'workIndicator': document.getElementById('work-indicator'),
        'winamp': document.getElementById('winamp'),
        'titleBar': document.getElementById('title-bar'),
    };

    // Make window dragable
    this.nodes.titleBar.addEventListener('mousedown',function(e){
        if(e.target !== this) {
            // Prevent going into drag mode when clicking any of the title
            // bar's icons by making sure the click was made directly on the
            // titlebar
            return true; }

        // Get starting window position
        var winampElm = self.nodes.winamp;

        // If the element was 'absolutely' positioned we could simply use
        // offsetLeft / offsetTop however the element is 'relatively'
        // positioned so we're using style.left. parseInt is used to remove the
        // 'px' postfix from the value
        var winStartLeft = parseInt(winampElm.style.left || 0,10),
            winStartTop  = parseInt(winampElm.style.top || 0,10);

        // Get starting mouse position
        var mouseStartLeft = e.clientX,
            mouseStartTop = e.clientY;

        // Mouse move handler function while mouse is down
        function handleMove(e) {
            // Get current mouse position
            var mouseLeft = e.clientX,
                mouseTop = e.clientY;

            // Calculate difference offsets
            var diffLeft = mouseLeft-mouseStartLeft,
                diffTop = mouseTop-mouseStartTop;

            // Move window to new position
            winampElm.style.left = (winStartLeft+diffLeft)+"px";
            winampElm.style.top = (winStartTop+diffTop)+"px";
        }

        // Mouse button up
        function handleUp() {
            removeListeners();
        }

        function removeListeners() {
            window.removeEventListener('mousemove',handleMove);
            window.removeEventListener('mouseup',handleUp);
        }

        window.addEventListener('mousemove',handleMove);
        window.addEventListener('mouseup',handleUp);
    });

    this.nodes.option.onclick = function() {
        // We don't support playing from URLs any more
    }

    this.nodes.close.onclick = function() {
        self.media.stop();
        self.setStatus('stop'); // Currently unneeded
        self.nodes.winamp.classList.add('closed');
    }

    this.media.addEventListener('timeupdate', function() {
        if(!self.nodes.winamp.classList.contains('setting-position')) {
            self.nodes.position.value = self.media.percentComplete();
        }
        self.updateTime();
    });

    this.media.addEventListener('visualizerupdate', function(bufferLength, dataArray) {
        if(self.visualizerStyle == 'oscilloscope') {
            self.visualizer.paintOscilloscopeFrame(bufferLength, dataArray);
        }
    });

    this.media.addEventListener('ended', function() {
        self.visualizer.clear();
        self.setStatus('stop');
    });

    this.media.addEventListener('waiting', function() {
        self.nodes.workIndicator.classList.add('selected');
    });

    this.media.addEventListener('playing', function() {
        self.setStatus('play');
        self.nodes.workIndicator.classList.remove('selected');
    });

    this.nodes.shade.onclick = function() {
        self.nodes.winamp.classList.toggle('shade');
    }

    this.nodes.time.onclick = function() {
        this.classList.toggle('countdown');
        self.updateTime();
    }

    this.nodes.shadeTime.onclick = function() {
        self.nodes.time.classList.toggle('countdown');
        self.updateTime();
    }

    this.nodes.visualizer.onclick = function() {
        if(self.visualizerStyle == false) {
            self.visualizerStyle = 'oscilloscope';
        } else if(self.visualizerStyle == 'oscilloscope') {
            self.visualizerStyle = false;
        }
        self.visualizer.clear();
    }

    this.nodes.previous.onclick = function() {
        // Implement this when we support playlists
    }

    this.nodes.play.onclick = function() {
        if(self.nodes.winamp.classList.contains('play')){
            self.media.stop();
        }
        self.media.play();
        self.setStatus('play');
    }

    this.nodes.pause.onclick = function() {
        if(self.nodes.winamp.classList.contains('pause')){
            self.media.play();
        } else {
            self.media.pause();
            self.setStatus('pause');
        }
    }

    this.nodes.stop.onclick = function() {
        self.media.stop();
        self.setStatus('stop');
    }

    this.nodes.next.onclick = function() {
        // Implement this when we support playlists
    }

    this.nodes.eject.onclick = function() {
        self.nodes.fileInput.click();
    }

    this.nodes.fileInput.onchange = function(e){
        self.loadFromFileReference(e.target.files[0]);
    }

    this.nodes.volume.onmousedown = function() {
        self.nodes.winamp.classList.add('setting-volume');
    }

    this.nodes.volume.onmouseup = function() {
        self.nodes.winamp.classList.remove('setting-volume');
    }

    this.nodes.volume.oninput = function() {
        self.setVolume(this.value);
    }

    this.nodes.position.onmousedown = function() {
        if(!self.nodes.winamp.classList.contains('stop')){
            self.nodes.winamp.classList.add('setting-position');
        }
    }

    this.nodes.position.onmouseup = function() {
        // This should only even be needed when we are stopped, but better safe
        // than sorry
        self.nodes.winamp.classList.remove('setting-position');
    }

    this.nodes.position.oninput = function() {
        var newPercentComplete = self.nodes.position.value;
        var newFractionComplete = newPercentComplete/100;
        var newElapsed = self._timeString(self.media.duration() * newFractionComplete);
        var duration = self._timeString(self.media.duration());
        var message = "Seek to: " + newElapsed + "/" + duration + " (" + newPercentComplete + "%)";
        self.font.setNodeToString(self.nodes.positionMessage, message);
    }

    this.nodes.position.onchange = function() {
        if(!self.nodes.winamp.classList.contains('stop')){
            self.media.seekToPercentComplete(this.value);
        }
    }

    this.nodes.balance.onmousedown = function() {
        self.nodes.winamp.classList.add('setting-balance');
    }

    this.nodes.balance.onmouseup = function() {
        self.nodes.winamp.classList.remove('setting-balance');
    }

    this.nodes.balance.oninput = function() {
        if(Math.abs(this.value) < 25) {
            this.value = 0;
        }
        self.setBalance(this.value);
    }

    this.nodes.repeat.onclick = function() {
        self.toggleRepeat();
    }

    this.nodes.shuffle.onclick = function() {
        self.toggleShuffle();
    }

    /* Functions */
    this.setStatus = function(className) {
        var statusOptions = ['play', 'stop', 'pause'];
        for(var i = 0; i < statusOptions.length; i++) {
            self.nodes.winamp.classList.remove(statusOptions[i]);
        }
        self.nodes.winamp.classList.add(className);
    }

    // From 0-100
    this.setVolume = function(volume) {
        // Ensure volume does not go out of bounds
        volume = Math.max(volume, 0);
        volume = Math.min(volume, 100);

        var percent = volume / 100;
        sprite = Math.round(percent * 28);
        offset = (sprite - 1) * 15;

        self.media.setVolume(percent);
        self.nodes.volume.style.backgroundPosition = '0 -' + offset + 'px';

        string = 'Volume: ' + volume + '%';
        self.font.setNodeToString(self.nodes.volumeMessage, string);

        // This shouldn't trigger an infinite loop with volume.onchange(),
        // since the value will be the same
        self.nodes.volume.value = volume;
    }

    // From -100 to 100
    this.setBalance = function(balance) {
        var string = '';
        if(balance == 0) {
            string = 'Balance: Center';
        } else if(balance > 0) {
            string = 'Balance: ' + balance + '% Right';
        } else {
            string = 'Balance: ' + Math.abs(balance) + '% Left';
        }
        self.font.setNodeToString(self.nodes.balanceMessage, string);

        balance = Math.abs(balance) / 100
        sprite = Math.round(balance * 28);
        offset = (sprite - 1) * 15;
        self.nodes.balance.style.backgroundPosition = '-9px -' + offset + 'px';
    }

    this.toggleRepeat = function() {
        self.media.toggleRepeat();
        self.nodes.repeat.classList.toggle('selected');
    }

    this.toggleShuffle = function() {
        self.media.toggleShuffle();
        self.nodes.shuffle.classList.toggle('selected');
    }

    // TODO: Refactor this function
    this.updateTime = function() {
        self.updateShadePositionClass();

        var shadeMinusCharacter = ' ';
        if(this.nodes.time.classList.contains('countdown')) {
            digits = this._timeObject(this.media.timeRemaining());
            var shadeMinusCharacter = '-';
        } else {
            digits = this._timeObject(this.media.timeElapsed());
        }
        this.font.displayCharacterInNode(shadeMinusCharacter, document.getElementById('shade-minus-sign'));

        html = digitHtml(digits[0]);
        document.getElementById('minute-first-digit').innerHTML = '';
        document.getElementById('minute-first-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[0], document.getElementById('shade-minute-first-digit'));
        html = digitHtml(digits[1]);
        document.getElementById('minute-second-digit').innerHTML = '';
        document.getElementById('minute-second-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[1], document.getElementById('shade-minute-second-digit'));
        html = digitHtml(digits[2]);
        document.getElementById('second-first-digit').innerHTML = '';
        document.getElementById('second-first-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[2], document.getElementById('shade-second-first-digit'));
        html = digitHtml(digits[3]);
        document.getElementById('second-second-digit').innerHTML = '';
        document.getElementById('second-second-digit').appendChild(html);
        this.font.displayCharacterInNode(digits[3], document.getElementById('shade-second-second-digit'));
    }

    // In shade mode, the position slider shows up differently depending on if
    // it's near the start, middle or end of its progress
    this.updateShadePositionClass = function() {
        var position = self.nodes.position;

        position.removeAttribute("class");
        if(position.value <= 33) {
            position.classList.add('left');
        } else if(position.value >= 66) {
            position.classList.add('right');
        }
    }

    this.dragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    this.dragover = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    this.drop = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var file = dt.files[0];
        self.loadFromFileReference(file);
    }

    this.nodes.winamp.addEventListener('dragenter', this.dragenter);
    this.nodes.winamp.addEventListener('dragover', this.dragover);
    this.nodes.winamp.addEventListener('drop', this.drop);

    this.loadFromFileReference = function(fileReference) {
        if(new RegExp("(wsz|zip)$", 'i').test(fileReference.name)) {
            self.skinManager.setSkinByFileReference(fileReference);
        } else {
            self.media.autoPlay = true;
            self.fileManager.bufferFromFileReference(fileReference, this._loadBuffer.bind(this));
            self._setTitle(fileReference.name);
        }
    }

    // Used only for the initial load, since it must have a CORS header
    this.loadFromUrl = function(url, fileName) {
        this.fileManager.bufferFromUrl(url, this._loadBuffer.bind(this));
        self._setTitle(fileName);
        this._setMetaData();
    }

    this._loadBuffer = function(buffer) {
        // Note, this will not happen right away
        this.media.loadBuffer(buffer, this._setMetaData);
    }

    this._setTitle = function(name) {
        name += '  ***  ';
        self.font.setNodeToString(document.getElementById('song-title'), name);
    }

    this._setMetaData = function() {
        var kbps = "128";
        var khz = "44";
        self.font.setNodeToString(document.getElementById('kbps'), kbps);
        self.font.setNodeToString(document.getElementById('khz'), khz);
        self._setChannels();
        self.updateTime();
    }

    this._setChannels = function() {
        var channels = self.media.channels();
        document.getElementById('mono').classList.remove('selected');
        document.getElementById('stereo').classList.remove('selected');
        if(channels == 1) {
            document.getElementById('mono').classList.add('selected');
        } else if(channels == 2) { 
            document.getElementById('stereo').classList.add('selected');
        }
    }

    /* Helpers */
    this._timeObject = function(time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - (minutes * 60);

        return [
            Math.floor(minutes / 10),
            Math.floor(minutes % 10),
            Math.floor(seconds / 10),
            Math.floor(seconds % 10)
        ];
    }

    this._timeString = function(time) {
        var timeObject = self._timeObject(time);
        return timeObject[0] + timeObject[1] + ':' + timeObject[2] + timeObject[3];
    }

    // TODO: Move to font.js
    function digitHtml(digit) {
        horizontalOffset = digit * 9;
        div = document.createElement('div');
        div.classList.add('digit');
        div.style.backgroundPosition = '-' + horizontalOffset + 'px 0';
        div.innerHTML = digit;
        return div;
    }

    // TODO: Move to font.js
    this.marqueeLoop = function() {
        setTimeout(function () {
            var text = self.nodes.songTitle.firstChild;
            // Only scroll if the text is too long
            if(text && text.childNodes.length > 30) {
                var characterNode = text.firstChild;
                text.removeChild(characterNode);
                text.appendChild(characterNode);
                self.marqueeLoop();
            }

        }, 220)
    }

}

keylog = [];
trigger = [78,85,76,27,76,27,83,79,70,84];
document.onkeyup = function(e){
    var key = e.keyCode;
    // Keys that correspond to node clicks
    var keyboardAction = {
        66: winamp.nodes.next, // B
        67: winamp.nodes.pause, // C
        76: winamp.nodes.eject, // L
        86: winamp.nodes.stop, // V
        82: winamp.nodes.repeat, // R
        83: winamp.nodes.shuffle, // S
        88: winamp.nodes.play, // X
        90: winamp.nodes.previous, // Z
        100: winamp.nodes.previous, // numpad 4
        101: winamp.nodes.play, // numpad 5
        102: winamp.nodes.next, // numpad 6
        96: winamp.nodes.eject // numpad 0
    };
    if(keyboardAction[key]){
        keyboardAction[key].click();
    }else if(e.keyCode == 76 && e.ctrlKey){ //CTRL+L
        winamp.nodes.option.click();
    }else{
        switch (key){
            // *1 is used to cast these values to integers. Could be improved.
            // up arrow
            case 38: winamp.setVolume((winamp.nodes.volume.value*1)+1); break;
            // numpad 8
            case 104: winamp.setVolume((winamp.nodes.volume.value*1)+1); break;
            // down arrow
            case 40: winamp.setVolume((winamp.nodes.volume.value*1)-1); break;
            // numpad 2
            case 98: winamp.setVolume((winamp.nodes.volume.value*1)-1); break;
            // left arrow
            case 37: winamp.media.seekToTime(winamp.media.timeElapsed() - 5); winamp.updateTime(); break;
            // numpad 7
            case 103: winamp.media.seekToTime(winamp.media.timeElapsed() - 5); winamp.updateTime(); break;
            // right arrow
            case 39: winamp.media.seekToTime(winamp.media.timeElapsed() + 5); winamp.updateTime(); break;
            // numpad 9
            case 105: winamp.media.seekToTime(winamp.media.timeElapsed() + 5); winamp.updateTime(); break;
            // numpad 1
            case 97: /* Placeholder for jump backwards 10 songs in playlist or to start of */ break;
            // numpad 3
            case 99: /* Placeholder for jump forwards 10 songs in playlist or to start of */ break;
        }
    }

    // Easter Egg
    keylog.push(key);
    keylog = keylog.slice(-10);
    if(keylog.toString() == trigger.toString()) {
        document.getElementById('winamp').classList.toggle('llama');
    }
}

winamp = new Winamp();
// XXX These should be moved to a constructor
winamp.setVolume(50);
winamp.setBalance(0);

file = 'https://cdn.rawgit.com/captbaritone/llama/master/llama.mp3';
fileName = "1. DJ Mike Llama - Llama Whippin' Intro (0:05)";
winamp.loadFromUrl(file, fileName);

winamp.marqueeLoop();
winamp.skinManager.setSkinByUrl('https://cdn.rawgit.com/captbaritone/winamp2-js/master/skins/base-2.91.wsz');
