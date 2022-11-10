const pb = require('../generated/echo_pb');

const data = {
    proto: 'echo',
    name: 'EchoService',
    methods: {
        sayHello: [
            {
                request: () => {
                    const message = new pb.EchoRequest();
                    message.setName('Ivan');
                    return message;
                },
                response: () => {
                    const message = new pb.EchoResponse();
                    message.setMessage('Hello, Ivan!');
                    return message;
                }
            },
            {
                request: () => {
                    const message = new pb.EchoRequest();
                    message.setName('Vasya');
                    return message;
                },
                response: () => {
                    const message = new pb.EchoResponse();
                    message.setMessage('Hello, Vasya!');
                    return message;
                }
            },
            {
                request: () => {
                    return new pb.EchoRequest();
                },
                response: () => {
                    const message = new pb.EchoResponse();
                    message.setMessage('Hello, World!');
                    return message;
                }
            }
        ]
    }
};

exports.data = data;
