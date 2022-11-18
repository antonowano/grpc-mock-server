const proto = 'authentication';
const service = 'AuthenticationService';

// const grpc = require('@grpc/grpc-js');
// const messages = require('../generated/' + proto + '_pb');
const services = require('../generated/' + proto + '_grpc_pb');

const empty = require('google-protobuf/google/protobuf/empty_pb');
// const timestamp = require('google-protobuf/google/protobuf/timestamp_pb');

exports.data = {
    service: services[service + 'Service'],
    methods: {
        validateToken: [
            {
                request: {
                    '@type': empty.Empty
                },
                response: {
                    '@type': empty.Empty
                }
            }
        ]
    }
};
