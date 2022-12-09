FROM node

RUN npm install -g grpc-tools
RUN npm install

WORKDIR /app

COPY . .
RUN rm -rf generated/ && mkdir generated/

RUN grpc_tools_node_protoc --proto_path=proto \
    --js_out=import_style=commonjs,binary:generated/ \
    --grpc_out=grpc_js:generated/ \
    proto/*.proto

RUN grpc_tools_node_protoc --proto_path=proto \
    --js_out=import_style=commonjs,binary:generated/ \
    proto/**/*.proto

CMD ["node", "./server.js"]
