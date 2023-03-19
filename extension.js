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

const openai = new OpenAIApi(configuration);

// System message primes GPT with the context for how it should reply
const messages = [{ role: "system", content: "You are a helpful assistant." }];

function activate(context) {
  let showChatPanel = vscode.commands.registerCommand(
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

      // Panel listeners:
      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case "callGPT":
              const response = await callGPT(message.input);
              panel.webview.postMessage({
                command: "gptResponse",
                response: response,
              });
              console.log(response);
              break;
            // ... other message handlers ...
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(showChatPanel);
}

// Submits API call to GPT-3.5

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

  return assistant_reply;
}

function getWebviewContent(webview) {
  const chatHTMLPath = path.join(__dirname, "webview", "chat.html");
  const handlersPath = path.join(__dirname, "src", "handlers.js");
  const handlersURI = webview.asWebviewUri(vscode.Uri.file(handlersPath));

  let HTMLContent = fs.readFileSync(chatHTMLPath, "utf8");
  HTMLContent = HTMLContent.replace("%handlers%", handlersURI);

  return HTMLContent;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
