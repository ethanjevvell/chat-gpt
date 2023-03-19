/**
 * @param {vscode.ExtensionContext} context
 */

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: vscode.workspace.getConfiguration("chatGPT").get("apiKey"),
});

const messages = [{ role: "system", content: "You are a helpful assistant." }];

const openai = new OpenAIApi(configuration);

function activate(context) {
  let showChatPeanel = vscode.commands.registerCommand(
    "code-gpt.showChatPanel",
    function () {
      const panel = vscode.window.createWebviewPanel(
        "code-GPT",
        "Chat with GPT-3.5",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent(panel.webview);

      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.type === "chatMessage") {
            // Process the chat message and get a response
            const response = await callGPT(message.meesage.content);

            // Send the response back to the webview
            panel.webview.postMessage({
              type: "chatResponse",
              text: response,
            });
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(showChatPeanel);

  let startChat = vscode.commands.registerCommand(
    "code-gpt.startChat",
    function () {
      callGPT();
    }
  );

  context.subscriptions.push(startChat);
}

async function callGPT(input) {
  if (input) {
    messages.push({ role: "user", content: input });
  }

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const assistant_reply = completion.data.choices[0].message.content;

  if (completion) {
    messages.push({ role: "assistant", content: assistant_reply });
  }

  return messages[-1];
}

function getWebviewContent(webview) {
  const chatHTMLPath = path.join(__dirname, "webview", "chat.html");
  const handlersPath = path.join(__dirname, "src", "handlers.js");
  const handlersURI = webview.asWebviewUri(vscode.Uri.file(handlersPath));

  let HTMLContent = fs.readFileSync(chatHTMLPath, "utf8");
  HTMLContent = HTMLContent.replace("%handlers%", handlersURI);

  return HTMLContent;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
