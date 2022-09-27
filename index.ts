import { RequestHandler } from 'express';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
const app = express();
const webSocketsServerPort = process.env.PORT || 3000;
const webSocketServer = require('websocket').server;

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static('public'));
app.use(cors);
const myMiddleware: RequestHandler = (req, res, next) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
};

app.get('/', myMiddleware);

const server = http.createServer(app);
server.listen(webSocketsServerPort, () => {
	console.log(`listening on port ${webSocketsServerPort}`);
});

const wsServer = new webSocketServer({
	httpServer: server,
});

const broadcast = (data: any) => {
	wsServer.connections.forEach((client: any) => {
		client.sendUTF(data);
	});
};

wsServer.on('request', (request: any) => {
	const connection = request.accept(null, request.origin);
	console.log('connection accepted');

	connection.on('message', (message: any) => {
		const data = JSON.parse(message.utf8Data);
		if (message.type === 'utf8') {
			switch (data.type) {
				case 'send-message':
					broadcast(message.utf8Data);
					break;
			}
		}
	});
});
