import * as consoleBuilder from '@api-components/api-console-builder';
import { RAMLAPI } from './ramlAPIs';
import * as path from 'path';

export default async (outDir: string, api: RAMLAPI) => {

	const project = new consoleBuilder.ApiConsoleProject({
		destination: outDir,
		api: api.FilePath,
		apiType: 'RAML 1.0',
		exitOnError: false
	});

	await project.bundle();
}