const grpc = require('@grpc/grpc-js');
const { join } = require('path');
const { readdirSync } = require('fs');

const pb = {};
const stubs = [];

readdirSync(join(__dirname, 'generated')).forEach(function(file) {
    const name = file.match(/^(.+)_pb.js$/i)[1];
    pb[name] = require('./generated/' + file);
});

readdirSync(join(__dirname, 'stubs')).forEach(function(file) {
    stubs.push(require('./stubs/' + file).data);
});

function callMethod(method) {
    return (call, callback) => {
        for (let data of method) {
            if (data.request().serializeBinary().toString() === call.request.serializeBinary().toString()) {
                callback(null, data.response());
            }
        }
    };
}

function main() {
    const server = new grpc.Server();
    for (let service of stubs) {
        const serviceDefinition = pb[service.proto + '_grpc'][service.name + 'Service'];
        const methods = {};
        for (let methodName in service.methods) {
            methods[methodName] = callMethod(service.methods[methodName]);
        }
        server.addService(serviceDefinition, methods);
    }
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();
