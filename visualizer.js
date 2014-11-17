/* Use Canvas to recreate the simple Winamp visualizer */
Visualizer = {
    do :
    true,
    init: function(canvasNode) {
        this.canvas = canvasNode;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasCtx.translate(1, 1); //  http://stackoverflow.com/questions/13593527/canvas-make-the-line-thicker
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        return this;
    },

    visualize: function(bufferLength, dataArray) {
        function avg() {
            var avg = 0;
            var count = 0;
            for (var l = lastIndex; l < index + 1; l++) {
                if (Visualizer.do)console.debug(l)
                avg += dataArray[l];
                count++;
            }
            var v = avg / count;
            return h * v / 128;
        }
        this.canvasCtx.clearRect(-2, -2, this.width + 2, this.height + 2); // +/- is just there to deal with offset, meh if its right or not ;)

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
            // if (this.done) console.debug(i, y, v, sliceWidth, i * sliceWidth, dataArray.length)
        }
        lastIndex = index + 1;
            index = i * sliceWidth | 0;

        // this.canvasCtx.lineTo(this.width, h * dataArray[dataArray.length - 1] / 128.0);
        this.canvasCtx.lineTo(this.width, avg());

        this.do = false;

        this.canvasCtx.stroke();
    }
}
