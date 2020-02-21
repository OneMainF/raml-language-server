# RAML Language Server

## Installation
To install, open the VS Code Marketplace or Extension Manager and select install. 

## Usage
### Validation
The RAML Language Server will automatically start when you open a file with the `.raml` file extension. Just open the file and begin working! Automatically detected errors will show as underlined tips right in the file, as well as in the Problems panel in VS Code. Simply hover over the underlinded section of the file to get real time hints. Be sure to save your changes often so the extension can validate your new edits.
### API Console
The API Console Pane will show up under under your Explorer tab. Upon expanding, it will scan the root folder for RAML files. If it finds a **valid** raml document that contains at least one resource (endpoint), it will put the value of the `title` field in the pane. To start the console, hover your mouse over the API in the API Console pane, and select the icon on the right. This will take some time to download all the required files to run the server, but will cache them for future use. Once the build is completed, it will output to a `.build` folder in the root directory and open a browser window to the server running in the background. If you make changes to the RAML, you must select the console button again to rebuild the API.

## Powered by the AML Modeling Framework
This extension is powered by the OpenSource Library maintained by The [AML Project](https://a.ml/) called [AMF](https://github.com/aml-org/amf/tree/master).

### AMF Version
- 4.0.4

## What's New
- API Console Server added.
- Moved under a new publisher called `OneMain`.
- Updated to the newest version of AMF to add new validation types.
- Fixed: Spaces in the file names is now acceptable.

## Known Issues
- There is a bug in the AMF core that does not allow the framework to read from working copies of the file. You must save your changes to the file to trigger a new validation.
	- This will be reported to AMF so they can work to fix this. A timeline will not be provided unfortunately.