const { Readable } = require('stream');

const myReadbleStream = () => {
    const data = [
        "This is the stream data 1",
        "This is the stream data 2",
        "This is the stream data 3",
        "This is the stream data 4",
        "This is the stream data 5"
    ];

    return new Readable({
        read () {
            if(data.length === 0) { 
                this.push(null);
            } else {
                this.push(data.shift());
            }
        }
    })
}

const readableStream = myReadbleStream();

readableStream.on('data', (data) => {
    console.log('Received Data ', data.toString());
});

readableStream.on('end', () => {
    console.log('End of data!!!');
})