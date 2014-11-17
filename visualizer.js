/* Use Canvas to recreate the simple Winamp visualizer */
Visualizer = {
    init: function(canvasNode) {
        this.canvas = canvasNode;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasCtx.imageSmoothingEnabled= false;
        this.canvasCtx.translate(1, 1); //  http://stackoverflow.com/questions/13593527/canvas-make-the-line-thicker
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.NONE = 0;
        this.OSCILLOSCOPE = 1;
        this.BAR = 2;
        return this;
    },

    clear: function() {
        // +/- is just there to deal with offset, meh if its right or not ;)
        this.canvasCtx.clearRect(-2, -2, this.width + 2, this.height + 2);
    },

    paintFrame: function(type, bufferLength, dataArray) {
        if(type == this.OSCILLOSCOPE) {
            return this._paintOscilloscopeFrame(bufferLength, dataArray);
        } else if(type == this.BAR) {
            return this._paintBarFrame(bufferLength, dataArray);
        }
    },

    _paintOscilloscopeFrame: function(bufferLength, dataArray) {
        function avg() {
            var avg = 0;
            var count = 0;
            for (var l = lastIndex; l < index + 1; l++) {
                avg += dataArray[l];
                count++;
            }
            var v = avg / count;
            return h * v / 128;
        }
        this.clear();

        this.canvasCtx.lineWidth = 2; // 2 because were shrinking the canvas by 2
        this.canvasCtx.strokeStyle = 'rgba(255, 255, 255,1)';

        this.canvasCtx.beginPath();

        var sliceWidth = bufferLength / this.width * 1;
        var h = this.height / 2;

        this.canvasCtx.moveTo(-2, h);
        var index = 0;
        var lastIndex = 0;
        for (var i = 0, iEnd = this.width * 1; i < iEnd; i += 2) {
            index = i * sliceWidth | 0;
            this.canvasCtx.lineTo(i, avg());
            lastIndex = index + 1;
        }
        lastIndex = index + 1;
            index = i * sliceWidth | 0;

        this.canvasCtx.lineTo(this.width, avg());
        this.canvasCtx.stroke();
    },

    _paintBarFrame: function(bufferLength, dataArray) {
        //this._analyser.fftSize = 256;

        this.clear();

        var barWidth = 6;
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            console.log(barHeight);

            this.canvasCtx.fillStyle = 'rgba(255,255,255,1)'; //' + (barHeight+100) + ',50,50)';
            this.canvasCtx.fillRect(x,this.height - barHeight/2,barWidth,barHeight/2);

            x += barWidth + 1;
        }
    }
}
