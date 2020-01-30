import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as amf from 'amf-client-js';

export class RAMLAPIProvider implements vscode.TreeDataProvider<RAMLAPI> {

	private _onDidChangeTreeData: vscode.EventEmitter<RAMLAPI | undefined> = new vscode.EventEmitter<RAMLAPI | undefined>();
	readonly onDidChangeTreeData: vscode.Event<RAMLAPI | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
		amf.AMF.init();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: RAMLAPI): vscode.TreeItem {
		return element;
	}

	getChildren(element?: RAMLAPI): Thenable<RAMLAPI[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		return Promise.resolve(this.getAPIsInWorkspace(this.workspaceRoot));
	}



	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private async getAPIsInWorkspace(workspaceDir: string): Promise<RAMLAPI[]> {

		let apis: RAMLAPI[] = [];

		if (this.pathExists(workspaceDir)) {

			let filesList = fs.readdirSync(workspaceDir);
			for (let file of filesList) {
				try {
					if (file.endsWith(".raml")) {

						let ramlFilePath = path.join(workspaceDir, file);

						let model = await amf.AMF.ramlParser().parseFileAsync("file://" + ramlFilePath);

						if (amf.AMF.validate(model, new amf.ProfileName("RAML"), amf.MessageStyles.AMF)) {
							let webAPI = <amf.model.document.Document>model;
							let api = <amf.model.domain.WebApi>webAPI.encodes;
							if (api.endPoints.length > 0) {

								let apiVersion = !api.version.isNullOrEmpty ? api.version.value() : "0.0";
								let apiName = `${path.basename(file)} : ${!api.name.isNullOrEmpty ? api.name.value() : ""} : ${apiVersion}`;

								apis.push(new RAMLAPI(apiName, apiVersion, ramlFilePath, vscode.TreeItemCollapsibleState.None));
							}
						}
					}
				}
				catch{ }
			}

			return apis;
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class RAMLAPI extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private version: string,
		private filePath: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command

	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return `${this.label}-${this.version}`;
	}

	get FilePath(): string {
		return this.filePath;
	}

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	contextValue = 'dependency';

}