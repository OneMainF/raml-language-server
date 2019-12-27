// import all vs code classes needed
import {
	TextDocuments,
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	TextDocumentPositionParams,
	Position,
	Range,
	Connection
} from 'vscode-languageserver';

// import the amf library to handle RAML parsing
import * as amf from 'amf-client-js';

import * as path from 'path';

import Settings from './Settings/Settings';

export default class ValidateFile {

	private initialized: boolean = false;
	public static includeDiagnosticRelatedInformation: boolean = false;

	constructor(includeDiagnosticRelatedInformation: boolean) {
		// must init the AMF library to use it for parsing and validation
		amf.AMF.init().then(() => {
			this.initialized = true;
		});

		ValidateFile.includeDiagnosticRelatedInformation = includeDiagnosticRelatedInformation;
	}

	public async validateTextDocument(connection: Connection, settings: Settings, textDocument: TextDocument): Promise<Diagnostic[]> {

		//only run the function when the AMF library has initialized
		if (!this.initialized)
			return [];

		connection.console.log("validateTextDocument");

		// normalize the path returned from vs code so it can be passed into the parser
		let documentURI: string = ValidateFile.normalizeURI(textDocument.uri);

		// cache list of diagnostics to return to IDE
		let diagnostics: Diagnostic[] = [];

		let amfProfile: amf.ProfileName = new amf.ProfileName("RAML");

		try {

			if (textDocument.getText().startsWith("#%Validation Profile")) {
				amfProfile = new amf.ProfileName("AMF");
			}

			let parser: amf.RamlParser = amf.AMF.ramlParser();

			// parse the document at the uri location but with the working copy of the contents (the file may not be saved yet so we can't check the actual contents)
			const model: amf.model.document.BaseUnit = await parser.parseStringAsync(documentURI, textDocument.getText());

			connection.console.log("Finished parsing model");

			let validationResults = await amf.AMF.validate(model, amfProfile, amf.MessageStyles.RAML);

			connection.console.log("Finished validating model");

			diagnostics = ValidateFile.convertValidationToDiagnostic(documentURI, textDocument.uri, validationResults);

			connection.console.log(`Diagnostic Count: ${diagnostics.length}`);

		} catch (error) {
			connection.console.log(`There was an error ${error}`);
		}

		// Send the computed diagnostics to VSCode.
		return diagnostics;
	}

	private static convertValidationToDiagnostic(normalizedDocumentURI: string, vsCodeDocumentURI: string, validationResults: amf.client.validate.ValidationReport) {
		let diagnostics: Diagnostic[] = [];

		if (!validationResults.conforms)
			for (let validation of validationResults.results) {
				let severity: DiagnosticSeverity = DiagnosticSeverity.Error;
				switch (validation.level) {
					case "Violation":
						severity = DiagnosticSeverity.Error;
						break;
					case "Warning":
						severity = DiagnosticSeverity.Warning;
						break;
					case "Info":
						severity = DiagnosticSeverity.Information;
						break;
					default:
						console.log(`Error: Unknown validation level: ${validation.level}`);
						break;
				}

				// default the error location to the range from the parser
				let errorRange: Range = {
					start: Position.create(validation.position.start.line - 1, validation.position.start.column),
					end: Position.create(validation.position.end.line - 1, validation.position.end.column)
				};

				let diagnostic: Diagnostic = {
					severity: severity,
					range: errorRange,
					message: validation.message
				};

				if (ValidateFile.includeDiagnosticRelatedInformation) {

					// store related diagnostic information
					let relatedMessage: string = "";

					// make sure the reported error is in the current document
					if (ValidateFile.normalizeURI(validation.location) !== normalizedDocumentURI) {

						// tell user where the error actually is
						relatedMessage = `Error located in referenced file: ${validation.location}`;

						// since we don't know where the file is referenced from the current file, 
						// position the error on the first line
						diagnostic.range = {
							start: Position.create(0, 0),
							end: Position.create(0, Number.MAX_VALUE)
						};

						diagnostic.relatedInformation = [
							{
								location: {
									uri: vsCodeDocumentURI,
									range: Object.assign({}, diagnostic.range)
								},
								message: relatedMessage
							}
						];
					}
				}

				diagnostics.push(diagnostic);

			}
		return diagnostics;
	}

	private static normalizeURI(vscodeURI: string): string {

		// always remove the drive letter from a path on windows
		let driveLetterReplace: RegExp = new RegExp("([a-zA-Z]%3A\\/)");
		vscodeURI = vscodeURI.replace(driveLetterReplace, "/");

		// normalize the path to the linux format to remove extra slashes
		vscodeURI = path.posix.normalize(vscodeURI);

		return vscodeURI;
	}

}
