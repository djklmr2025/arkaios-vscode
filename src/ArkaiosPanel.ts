import * as vscode from 'vscode';
import * as path from 'path';

type FileContext = {
    fileName: string;
    language: string;
    content: string;
};

export class ArkaiosPanel {
    public static currentPanel: ArkaiosPanel | undefined;
    private static readonly viewType = 'arkaiosChat';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _initialPrompt?: string;
    private _fileContext?: FileContext;

    public static createOrShow(
        context: vscode.ExtensionContext,
        initialPrompt?: string,
        fileContext?: FileContext
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ArkaiosPanel.currentPanel) {
            ArkaiosPanel.currentPanel._panel.reveal(column);
            ArkaiosPanel.currentPanel._setInitialData(initialPrompt, fileContext);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            ArkaiosPanel.viewType,
            'ARKAIOS Assistant',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionUri.fsPath, 'media'))]
            }
        );

        ArkaiosPanel.currentPanel = new ArkaiosPanel(panel, context.extensionUri, initialPrompt, fileContext);
    }

    public static dispose() {
        if (ArkaiosPanel.currentPanel) {
            ArkaiosPanel.currentPanel.dispose();
        }
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        initialPrompt?: string,
        fileContext?: FileContext
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._initialPrompt = initialPrompt;
        this._fileContext = fileContext;

        this._update();
        this._sendInitialData();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'ask':
                        await this._handleChat(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private async _handleChat(text: string) {
        this._panel.webview.postMessage({ command: 'response', text: `Analizando: ${text}... (Native API logic)` });
    }

    private _setInitialData(initialPrompt?: string, fileContext?: FileContext) {
        this._initialPrompt = initialPrompt;
        this._fileContext = fileContext;
        this._sendInitialData();
    }

    private _sendInitialData() {
        if (!this._initialPrompt && !this._fileContext) {
            return;
        }
        this._panel.webview.postMessage({
            command: 'seed',
            prompt: this._initialPrompt || '',
            context: this._fileContext || null
        });
    }

    public dispose() {
        ArkaiosPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ARKAIOS Chat</title>
                <style>
                    body { font-family: sans-serif; padding: 10px; background-color: #1e1e1e; color: #fff; }
                    #chat { height: 400px; border: 1px solid #333; overflow-y: auto; margin-bottom: 10px; padding: 10px; background: #252526; }
                    #input { width: 100%; padding: 8px; box-sizing: border-box; background: #3c3c3c; color: white; border: 1px solid #555; }
                    .msg { margin-bottom: 8px; }
                    .user { color: #007acc; font-weight: bold; }
                    .ai { color: #4ec9b0; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>ARKAIOS AI Builder</h2>
                <div id="chat"></div>
                <input type="text" id="input" placeholder="Escribe tu consulta o comando..." />
                <script>
                    const vscode = acquireVsCodeApi();
                    const chat = document.getElementById('chat');
                    const input = document.getElementById('input');

                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const text = input.value;
                            if(!text) return;
                            vscode.postMessage({ command: 'ask', text });
                            input.value = '';
                            appendMsg('user', 'Tú: ' + text);
                        }
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.command === 'response') {
                            appendMsg('ai', 'ARKAIOS: ' + message.text);
                        }
                        if (message.command === 'seed') {
                            if (message.context) {
                                appendMsg('ai', 'Contexto cargado: ' + message.context.fileName + ' (' + message.context.language + ')');
                            }
                            if (message.prompt) {
                                input.value = message.prompt;
                                input.focus();
                            }
                        }
                    });

                    function appendMsg(type, text) {
                        const div = document.createElement('div');
                        div.className = 'msg ' + type;
                        div.textContent = text;
                        chat.appendChild(div);
                        chat.scrollTop = chat.scrollHeight;
                    }
                </script>
            </body>
            </html>`;
    }
}
