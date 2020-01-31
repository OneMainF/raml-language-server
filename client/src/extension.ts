import * as path from 'path';

import { workspace, ExtensionContext, window, commands } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

import {
	RAMLAPIProvider,
	RAMLAPI
} from './lib/ramlAPIs';

import bundleAPI from './lib/bundleAPIConsole';

import startConsoleServer from './lib/startConsoleServer';

let client: LanguageClient;
let consoleDir: string = ".build";

export function activate(context: ExtensionContext) {

	//#region API console

	// fully qualify the path the the build directory
	if (workspace.workspaceFolders) {
		let workspaceRoot = path.normalize(workspace.workspaceFolders[0].uri.fsPath);

		consoleDir = path.join(workspaceRoot, consoleDir);

		// Create the implementation of the pane in the explorer
		const RAMLAPIsProvider = new RAMLAPIProvider(workspaceRoot);
		window.registerTreeDataProvider('apiConsole', RAMLAPIsProvider);

		// When the console icon is selected on an item in the pane, run this to build the API and start the server
		commands.registerCommand('apiConsole.openConsole', async (api: RAMLAPI) => {
			try {
				window.showInformationMessage(`Building and starting API Console on ${api.label}. This may take a moment.`);

				await bundleAPI(consoleDir, api);

				// window.showInformationMessage(`Successfully bundled API Console on ${api.label}.`);

				let port = 8000;

				startConsoleServer(consoleDir, port);

				window.showInformationMessage(`Successfully started API Console server at http://127.0.0.1:${port}/`);
			}
			catch (e) {
				window.showInformationMessage(`Failed to bundle API Console on ${api.label}.\n\r${e.message}`);
			}
		});

		// when the refresh button is used at the top of the API Console pane, run the refresh method in the implementation class
		commands.registerCommand('apiConsole.refreshEntry', () => RAMLAPIsProvider.refresh());
	}

	//#endregion

	//#region Language Server

	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for raml documents
		documentSelector: [{ scheme: 'file', language: 'raml' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'RAML-LS',
		'RAML Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	//#endregion
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

