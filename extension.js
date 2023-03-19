
/**
 * @param {vscode.ExtensionContext} context
 */

const vscode = require('vscode');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: vscode.workspace.getConfiguration('chatGPT').get('apiKey')
});

const openai = new OpenAIApi(configuration);

function activate(context) {

	let helloWorld = vscode.commands.registerCommand('code-gpt.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Code-GPT!');
	});

	context.subscriptions.push(helloWorld);

	let sendPrompt = vscode.commands.registerCommand('code-gpt.sendPrompt', async function () {
		const result = await callGPT();
		console.log(result);
	});

	context.subscriptions.push(sendPrompt);

}

async function callGPT() {

	const messages = [
		{role: "system", content: "You are a helpful assistant."},
		{role: "user", content: "Hi"}
	];

	const input = await vscode.window.showInputBox({
		prompt: 'Enter a message for GPT-3.5',
		placeHolder: 'Type something...'
	  });

	if (input) {
		messages.push({role: "user", content: input});
	}

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: messages
	  });

	return completion.data.choices[0].message;
}  

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
