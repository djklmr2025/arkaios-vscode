import * as vscode from 'vscode';
import * as path from 'path';
import { ArkaiosPanel } from './ArkaiosPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('ARKAIOS Lab extension activated');

  // Comando: abrir panel principal
  context.subscriptions.push(
    vscode.commands.registerCommand('arkaios.openPanel', () => {
      ArkaiosPanel.createOrShow(context);
    })
  );

  // Comando: explicar codigo seleccionado
  context.subscriptions.push(
    vscode.commands.registerCommand('arkaios.explainCode', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('ARKAIOS: No hay editor activo');
        return;
      }
      const selection = editor.document.getText(editor.selection);
      if (!selection.trim()) {
        vscode.window.showWarningMessage('ARKAIOS: Selecciona codigo primero');
        return;
      }
      const lang = editor.document.languageId;
      const prompt = `Explica este codigo en ${lang} de forma clara y concisa:\n\n\`\`\`${lang}\n${selection}\n\`\`\``;
      ArkaiosPanel.createOrShow(context, prompt);
    })
  );

  // Comando: refactorizar codigo seleccionado
  context.subscriptions.push(
    vscode.commands.registerCommand('arkaios.refactorCode', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('ARKAIOS: No hay editor activo');
        return;
      }
      const selection = editor.document.getText(editor.selection);
      if (!selection.trim()) {
        vscode.window.showWarningMessage('ARKAIOS: Selecciona codigo primero');
        return;
      }
      const lang = editor.document.languageId;
      const prompt = `Refactoriza este codigo ${lang} para que sea mas limpio, eficiente y siga buenas practicas:\n\n\`\`\`${lang}\n${selection}\n\`\`\``;
      ArkaiosPanel.createOrShow(context, prompt);
    })
  );

  // Comando: preguntar con contexto del archivo completo
  context.subscriptions.push(
    vscode.commands.registerCommand('arkaios.askWithContext', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('ARKAIOS: No hay editor activo');
        return;
      }
      const fileContent = editor.document.getText();
      const fileName = path.basename(editor.document.fileName) || 'archivo';
      const lang = editor.document.languageId;
      ArkaiosPanel.createOrShow(context, undefined, {
        fileName,
        language: lang,
        content: fileContent
      });
    })
  );
}

export function deactivate() {
  ArkaiosPanel.dispose();
}
