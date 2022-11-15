const { Duplex } = require("stream");

const data = [];

const myDuplex = new Duplex({

    write(chunk, enc, next) {
        data.push(chunk);
        next();
    },
    
    read () {
        if(data.length === 0) { 
            this.push(null);
        } else {
            this.push(data.shift());
        }
    }
})

myDuplex.on('data', (data) => {
    console.log('Received Data ', data.toString());
});

myDuplex.on('end', () => {
    console.log('End of file reached!!!');
})

myDuplex.on('finish', () => {
    console.log('Writing Done!!!');
})

myDuplex.write("This is the stream data 1\n");
myDuplex.write("This is the stream data 2\n");
myDuplex.write("This is the stream data 3\n");

myDuplex.end("Done!!!!");