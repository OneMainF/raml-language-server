# RAML Language Server

## Installation
To install, open the VS Code Marketplace or Extension Manager and select install. 

## Usage
The RAML Language Server will automatically start when you open a file with the `.raml` file extension. Just open the file and begin working! Automatically detected errors will show as underlined tips right in the file, as well as in the Problems panel in VS Code. Simply hover over the underlinded section of the file to get real time hints. Be sure to save your changes often so the extension can validate your new edits.

## Powered by the AML Modeling Framework
This extension is powered by the OpenSource Library maintained by AML called [AMF](https://github.com/aml-org/amf/tree/master).

### AMF Version
- 4.0.3

## What's New
- Moved under a new publisher called `OneMain`
- Updated to the newest version of AMF to add new validation types.
- Internal code structure changes to increase performance and maintainability.
- Added another validation event when a RAML file is saved to revalidate all RAML files. This is to aid with the AMF bug that prevents validation on working copies of the document.

## Known Issues
- There is a bug in the AMF core that does not allow the framework to read from working copies of the file. You must save your changes to the file to trigger a new validation.
	- This will be reported to AMF so they can work to fix this. A timeline will not be provided unfortunately.