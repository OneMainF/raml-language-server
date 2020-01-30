import * as server from 'node-http-server';
import * as path from 'path';
import * as open from 'open';

let serverStarted: boolean = false;

export default (rootPath: string, port: number) => {
	if (!serverStarted)
		server.deploy({
			port: port,
			root: rootPath
		},
			serverReady);
	else {
		open(`http://127.0.0.1:${server.config.port}/`);
	}
}

function serverReady(server) {
	serverStarted = true;

	open(`http://127.0.0.1:${server.config.port}/`);
}