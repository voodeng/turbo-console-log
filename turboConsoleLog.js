const vscode = require('vscode')
const logMessage = require('./log-message')

function activate (context) {
  let detectAllByExt = vscode.workspace.getConfiguration('turbocl').detectAllByExt;

  vscode.commands.registerCommand('turboConsoleLog.toggleOnlyByExt', () => {
    detectAllByExt = !detectAllByExt
    vscode.window.showInformationMessage(detectAllByExt ? 'now ONLY Detect this Extension added log!' : 'now Detect all log!');
  })
  vscode.commands.registerCommand('turboConsoleLog.displayLogMessage', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const selection = editor.selection
    const selectedVar = document.getText(selection)
    const lineOfSelectedVar = selection.active.line
    // Check if the selection line is not the last line in the document
    if (!(lineOfSelectedVar === (document.lineCount - 1))) {
      editor.edit(editBuilder => {
        const wrapLogMessage = vscode.workspace.getConfiguration('turbocl').wrapLogMessage || false;
        editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), logMessage.message(document, selectedVar, lineOfSelectedVar, wrapLogMessage))
      })
    }
  })
  vscode.commands.registerCommand('turboConsoleLog.commentAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const logMessagesRanges = detectAllByExt ? logMessage.detectAllByExt(document) : logMessage.detectAll(document)
    editor.edit(editBuilder => {
      logMessagesRanges.forEach(logMessageRange => {
        let nbrOfSpaces = 0
        nbrOfSpaces = document.lineAt(logMessageRange.start).firstNonWhitespaceCharacterIndex
        editBuilder.delete(logMessageRange)
        editBuilder.insert(new vscode.Position(logMessageRange.start.line, 0), `${' '.repeat(nbrOfSpaces)}// ${document.getText(logMessageRange).trim()}\n`)
      })
    })
  })
  vscode.commands.registerCommand('turboConsoleLog.uncommentAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const logMessagesRanges = detectAllByExt ? logMessage.detectAllByExt(document) : logMessage.detectAll(document)
    editor.edit(editBuilder => {
      logMessagesRanges.forEach(logMessageRange => {
        let nbrOfSpaces = 0
        nbrOfSpaces = document.lineAt(logMessageRange.start).firstNonWhitespaceCharacterIndex
        // document.getText(logMessageRange).replace(/\//g, '')
        const oldText = document.getText(logMessageRange)
        const inxCL = oldText.indexOf('console.log')
        const newText = oldText.substr(0, inxCL).replace('// ', '') + oldText.substr(inxCL)

        editBuilder.delete(logMessageRange)
        editBuilder.insert(new vscode.Position(logMessageRange.start.line, 0), `${' '.repeat(nbrOfSpaces)}${newText.trim()}\n`)
      })
    })
  })
  vscode.commands.registerCommand('turboConsoleLog.deleteAllLogMessages', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }
    const document = editor.document
    const logMessagesRanges = detectAllByExt ? logMessage.detectAllByExt(document) : logMessage.detectAll(document)

    editor.edit(editBuilder => {
      logMessagesRanges.forEach(logMessageRange => {
        editBuilder.delete(logMessageRange)
      })
    })
  })
}

exports.activate = activate
