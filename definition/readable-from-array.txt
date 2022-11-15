const { Readable } = require('stream');

const data = [
    "This is the stream data 1",
    "This is the stream data 2",
    "This is the stream data 3",
    "This is the stream data 4",
    "This is the stream data 5"
];

const readableStream = Readable.from(data);

readableStream.on('data', (data) => {
    console.log('Received Data ', data.toString());
});

readableStream.on('end', () => {
    console.log('End of data!!!');
})