/* Use Canvas to recreate the simple Winamp visualizer */
Visualizer = {
    init: function(canvasNode) {
        this.canvas = canvasNode;
        this.canvasCtx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        return this;
    },

    visualize: function(bufferLength, dataArray) {
        this.canvasCtx.clearRect(0, 0, this.width, this.height);

        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

        this.canvasCtx.beginPath();

        var sliceWidth = this.width * 1.0 / bufferLength;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * this.height/2;

            if(i === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.canvasCtx.lineTo(this.width, this.height/2);
        this.canvasCtx.stroke();
    }
}
