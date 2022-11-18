const grpc = require('@grpc/grpc-js');
const { readdirSync } = require('fs');

function setter(fieldName) {
    const camelFieldName = fieldName.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );
    return 'set' + camelFieldName.substring(0, 1).toUpperCase() + camelFieldName.substring(1);
}

function createMessageFromObject(obj) {
    const message = new obj['@type']();
    for (let field in obj) {
        if (field === '@type') continue;
        if (Array.isArray(obj[field]) && obj[field].length > 0) {
            const val = [];
            for (let value of obj[field]) {
                val.push(createMessageFromObject(value));
            }
            message[setter(field)](val);
        } else if (typeof obj[field] === 'object' && obj[field] !== null) {
            message[setter(field)](createMessageFromObject(obj[field]));
        } else if (obj[field] !== null) {
            message[setter(field)](obj[field]);
        }
    }
    return message;
}

function callMethod(method) {
    return (call, callback) => {
        for (let set of method) {
            const request = createMessageFromObject(set.request);
            // const auth = call.metadata.internalRepr.get('authorization');
            if (request.serializeBinary().toString() === call.request.serializeBinary().toString()) {
                const error = set.responseError || null;
                const response = set.response ? createMessageFromObject(set.response) : null;
                callback(error, response);
            }
        }
    };
}

function main() {
    const server = new grpc.Server();
    readdirSync('./stubs').forEach(function(file) {
        const service = require('./stubs/' + file).data;
        const methods = {};
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
