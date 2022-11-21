const proto = 'authentication';
const service = 'AuthenticationService';

const grpc = require('@grpc/grpc-js');
const messages = require('../generated/' + proto + '_pb');
const services = require('../generated/' + proto + '_grpc_pb');

const empty = require('google-protobuf/google/protobuf/empty_pb');
const timestamp = require('google-protobuf/google/protobuf/timestamp_pb');
const errorDetails = require('../generated/google/error_details_pb');

exports.data = {
    service: services[service + 'Service'],
    methods: {
        validateToken: [
            {
                request: {
                    '@type': empty.Empty,
                    '@auth': 'Bearer 123'
                },
                response: {
                    '@type': empty.Empty
                }
            },
            {
                request: {
                    '@type': empty.Empty,
                    '@auth': 'Bearer badtoken'
                },
                responseError: {
                    'code': grpc.status.UNAUTHENTICATED
                }
            },
            {
                request: {
                    '@type': empty.Empty,
                    '@auth': 'Bearer noretail'
                },
                responseError: {
                    'code': grpc.status.PERMISSION_DENIED
                }
            }
        ],
        authenticateUser: [
            {
                request: {
                    '@type': messages.AuthenticationUserRequest,
                    badge: '41016',
                    password: '123'
                },
                response: {
                    '@type': messages.AuthenticationUserResponse,
                    token: {
                        '@type': messages.AccessToken,
                        hash: 'retail41016',
                        date_creation: {
                            '@type': timestamp.Timestamp,
                            seconds: 1669018346
                        }
                    },
                    user: {
                        '@type': messages.AuthenticatedUser,
                        name: 'Иван',
                        surname: 'Антонов',
                        badge: '41016',
                        role: 1,
                    },
                }
            },
            {
                request: {
                    '@type': messages.AuthenticationUserRequest,
                    badge: '',
                    password: ''
                },
                responseError: {
                    code: grpc.status.INVALID_ARGUMENT,
                    message: 'Форма заполнена неправильно'
                },
                metadata: {
                    'proto.google.rpc.BadRequest-bin': {
                        '@type': errorDetails.BadRequest,
                        field_violations: [
                            {
                                '@type': errorDetails.BadRequest.FieldViolation,
                                field: 'badge',
                                description: 'Это поле не может быть пустым'
                            },
                            {
                                '@type': errorDetails.BadRequest.FieldViolation,
                                field: 'password',
                                description: 'Это поле не может быть пустым'
                            }
                        ]
                    }
                }
            }
        ]
    }
};
