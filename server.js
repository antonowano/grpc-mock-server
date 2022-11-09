const grpc = require('@grpc/grpc-js');
const { resolve, join } = require('path');
const { readdirSync } = require('fs');
const { readdir, readFile } = require('fs').promises;
const pb = {
    google_protobuf_empty: require('google-protobuf/google/protobuf/empty_pb.js'),
    google_protobuf_timestamp: require('google-protobuf/google/protobuf/timestamp_pb.js'),
};

readdirSync(join(__dirname, 'generated')).forEach(function(file) {
    const name = file.match(/^(.+)_pb.js$/i)[1];
    pb[name] = require('./generated/' + file);
});

async function getFileList(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map((entry) => {
        const result = resolve(dir, entry.name);
        return entry.isDirectory() ? getFileList(result) : result;
    }));
    return Array.prototype.concat(...files);
}

async function loadDataFromFiles(files) {
    const data = [];
    for (let file of files) {
        let rawData = await readFile(file);
        data.push(JSON.parse(rawData));
    }
    return data;
}

function objIsEquelToMessage(obj, message) {
    return true;
}

function fillMessageFromObj(message, obj) {
}

function callMethod(method) {
    return (call, callback) => {
        for (let data of method.dataset) {
            if (objIsEquelToMessage(data.request, call.request)) {
                const response = new pb[method.response.proto][method.response.name]();
                fillMessageFromObj(response, data.response);
                callback(null, response);
                return;
            }
        }
    };
}

function startServer(serviceList) {
    const server = new grpc.Server();
    for (let service of serviceList) {
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

const { EchoRequest, EchoResponse } = require('./generated/echo_pb');

function main() {
    console.log(EchoRequest);
    const mes = new EchoRequest();
    mes.setName('Ivan');
    mes.deserializeBinary();

    Promise.resolve()
        .then(_ => getFileList('stubs'))
        .then(files => loadDataFromFiles(files))
        //.then(result => { console.log(result); return result; })
        .then(serviceList => startServer(serviceList))
    ;
}

main();
