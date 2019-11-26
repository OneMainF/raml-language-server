# RAML Language Server

This is an extension for VS Code that performs real time validation on RAML files. It is currently a work in progress and not published for use. Contributions are welcomed.

This extension uses the [AML Modeling Framework](https://github.com/aml-org/amf/tree/master) to parse the files and provide realtime validation. Future state will also allow passing in custom validation documents to provide extended validation rules.

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
