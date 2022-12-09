const proto = 'authentication';
const service = 'AuthenticationService';

const grpc = require('@grpc/grpc-js');
const messages = require('../generated/' + proto + '_pb');
const services = require('../generated/' + proto + '_grpc_pb');

const { Empty } = require('google-protobuf/google/protobuf/empty_pb');
const { Timestamp } = require('google-protobuf/google/protobuf/timestamp_pb');
const { BadRequest } = require('../generated/google/error_details_pb');

exports.stub = {
    service: services[service + 'Service'],
    methods: {
        validateToken: [
            {
                request: {
                    '@type': Empty,
                    '@auth': [
                        'Bearer retail41016',
                    ],
                },
                response: {
                    '@type': Empty
                }
            },
            {
                request: {
                    '@type': Empty
                },
                responseError: {
                    code: grpc.status.UNAUTHENTICATED
                }
            },
            {
                request: {
                    '@type': Empty,
                    '@auth': 'Bearer badtoken'
                },
                responseError: {
                    code: grpc.status.UNAUTHENTICATED
                }
            },
            {
                request: {
                    '@type': Empty,
                    '@auth': 'Bearer noretail'
                },
                responseError: {
                    code: grpc.status.PERMISSION_DENIED
                }
            },
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
                            '@type': Timestamp,
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
                        '@type': BadRequest,
                        field_violations: [
                            {
                                '@type': BadRequest.FieldViolation,
                                field: 'badge',
                                description: 'Это поле не может быть пустым'
                            },
                            {
                                '@type': BadRequest.FieldViolation,
                                field: 'password',
                                description: 'Это поле не может быть пустым'
                            }
                        ]
                    }
                }
            },
            {
                request: {
                    '@type': messages.AuthenticationUserRequest,
                    badge: '007',
                    password: '123'
                },
                responseError: {
                    code: grpc.status.PERMISSION_DENIED,
                    message: 'Пользователь не имеет прав на авторизацию'
                }
            },
            {
                request: {
                    '@type': messages.AuthenticationUserRequest,
                    badge: '008',
                    password: '123'
                },
                responseError: {
                    code: grpc.status.UNAUTHENTICATED,
                    message: 'Бейдж или пароль указаны неверно'
                }
            },
        ],
        restorePassword: [
            {
                request: {
                    '@type': messages.PasswordRecoveryRequest,
                    badge: '008'
                },
                response: {
                    '@type': Empty
                }
            },
            {
                request: {
                    '@type': messages.PasswordRecoveryRequest,
                    badge: ''
                },
                responseError: {
                    code: grpc.status.INVALID_ARGUMENT,
                    message: 'Форма заполнена неправильно'
                },
                metadata: {
                    'proto.google.rpc.BadRequest-bin': {
                        '@type': BadRequest,
                        field_violations: [
                            {
                                '@type': BadRequest.FieldViolation,
                                field: 'badge',
                                description: 'Это поле не может быть пустым'
                            }
                        ]
                    }
                }
            },
            {
                request: {
                    '@type': messages.PasswordRecoveryRequest,
                    badge: '007'
                },
                responseError: {
                    code: grpc.status.PERMISSION_DENIED,
                    message: 'Вы заблокированы'
                }
            }
        ],
    }
};
