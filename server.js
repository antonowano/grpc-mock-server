const grpc = require('@grpc/grpc-js');
const { readdirSync } = require('fs');

function setter(fieldName) {
    const camelFieldName = fieldName.toLowerCase().replace(/([-_][a-z0-9])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );
    return 'set' + camelFieldName.substring(0, 1).toUpperCase() + camelFieldName.substring(1);
}

function createMessageFromObject(obj) {
    let message;
    try {
        message = new obj['@type']();
    } catch(err) {
        console.log(err, obj);
    }
    for (let field in obj) {
        if (field.startsWith('@')) continue;
        try {
            if (Array.isArray(obj[field])) {
                const val = [];
                for (let value of obj[field]) {
                    val.push(typeof value === 'object' ? createMessageFromObject(value) : value);
                }
                message[setter(field) + 'List'](val);
            } else if (typeof obj[field] === 'object' && obj[field] !== null) {
                message[setter(field)](createMessageFromObject(obj[field]));
            } else if (obj[field] !== null) {
                message[setter(field)](obj[field]);
            }
        } catch(err) {
            console.log(err, obj);
        }
    }
    return message;
}

function callMethod(method) {
    return (call, callback) => {
        const realRequest = call.request.serializeBinary().toString();
        let realAuthorization = call.metadata.internalRepr.get('authorization');
        realAuthorization = realAuthorization ? realAuthorization.toString() : undefined;
        for (let set of method) {
            const expectedRequest = createMessageFromObject(set.request).serializeBinary().toString();
            const isMatchingRequest = expectedRequest === realRequest;
            const expectedAuthorization = set.request['@auth'];
            const isMatchingAuthorization = Array.isArray(expectedAuthorization)
                ? expectedAuthorization.indexOf(realAuthorization) !== -1
                : (expectedAuthorization === realAuthorization);
            if (isMatchingRequest && isMatchingAuthorization) {
                const error = set.responseError || null;
                const response = set.response ? createMessageFromObject(set.response) : null;
                const trailers = new grpc.Metadata();
                for (let key in set.metadata) {
                    if (key.endsWith('-bin')) {
                        trailers.add(key, Buffer.from(createMessageFromObject(set.metadata[key]).serializeBinary()));
                    } else {
                        trailers.add(key, set.metadata[key]);
                    }
                }
                callback(error, response, trailers);
            }
        }
    };
}

function main() {
    const server = new grpc.Server();
    readdirSync('./stubs').forEach(function(file) {
        const service = require('./stubs/' + file).stub;
        const methods = {};
        if (typeof service === 'undefined') {
            return;
        }
        for (let methodName in service.methods) {
            methods[methodName] = callMethod(service.methods[methodName]);
        }
        server.addService(service.service, methods);
    });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();
