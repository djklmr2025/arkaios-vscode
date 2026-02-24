# ARKAIOS VSCode

Extension de VSCode para abrir un panel de asistente ARKAIOS y enviar prompts desde el editor.

## Comandos

- `ARKAIOS: Abrir Chat`
- `ARKAIOS: Explicar codigo seleccionado`
- `ARKAIOS: Refactorizar codigo seleccionado`
- `ARKAIOS: Preguntar con contexto del archivo`

## Desarrollo local

1. `npm install`
2. `npm run compile`
3. Presiona `F5` en VSCode para abrir Extension Development Host

## Empaquetado

1. `npm run compile`
2. `npx @vscode/vsce package`

## Estado actual

- El panel Webview y los comandos ya funcionan.
- La capa de llamada nativa a API en `ArkaiosPanel.ts` sigue como placeholder y debe completarse.
