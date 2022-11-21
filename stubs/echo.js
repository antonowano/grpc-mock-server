const proto = 'echo';
const service = 'EchoService';

const grpc = require('@grpc/grpc-js');
const messages = require('../generated/' + proto + '_pb');
const services = require('../generated/' + proto + '_grpc_pb');

const { Empty } = require('google-protobuf/google/protobuf/empty_pb');

exports.data = {
    service: services[service + 'Service'],
    methods: {
        sayHello: [
            {
                request: {
                    '@type': messages.EchoRequest,
                    name: 'Ivan'
                },
                response: {
                    '@type': messages.EchoResponse,
                    message: 'Hello Ivan!'
                }
            },
            {
                request: {
                    '@type': messages.EchoRequest,
                    name: 'Vasya'
                },
                responseError: {
                    code: grpc.status.PERMISSION_DENIED,
                    message: 'who you are?'
                }
            },
            {
                request: {
                    '@type': messages.EchoRequest
                },
                response: {
                    '@type': messages.EchoResponse,
                    message: 'Hello, World!'
                }
            },
        ],
        sayHelloRetail: [
            {
                request: {
                    '@type': Empty
                },
                response: {
                    '@type': messages.EchoResponse,
                    message: 'Hello, Retail!'
                }
            },
        ],
        sayHelloDelivery: [
            {
                request: {
                    '@type': Empty
                },
                response: {
                    '@type': messages.EchoResponse,
                    message: 'Hello, Delivery!'
                }
            },
        ],
        sayHelloManager: [
            {
                request: {
                    '@type': Empty
                },
                response: {
                    '@type': messages.EchoResponse,
                    message: 'Hello, Manager!'
                }
            },
        ],
    }
};
