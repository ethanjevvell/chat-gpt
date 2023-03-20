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
  var mainChatPanel;

  // Begin disposables (commands)
  let showChatPanel = vscode.commands.registerCommand(
    "code-gpt.showChatPanel",
    function () {
      if (!mainChatPanel) {
        mainChatPanel = vscode.window.createWebviewPanel(
          "code-GPT",
          "Chat with GPT-3.5",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
          }
        );
        mainChatPanel.webview.html = getWebviewContent(mainChatPanel.webview);

        // Panel listeners:
        mainChatPanel.webview.onDidReceiveMessage(
          async (message) => {
            switch (message.command) {
              case "callGPT":
                const response = callGPT(message.input);
                postChatResponse(response);
                break;
            }
          },
          undefined,
          context.subscriptions
        );

        mainChatPanel.onDidDispose(function () {
          mainChatPanel = undefined;
        });
      }
      mainChatPanel.reveal(vscode.ViewColumn.One);
    }
  );
  context.subscriptions.push(showChatPanel);

  let toggleDarkMode = vscode.commands.registerCommand(
    "code-gpt.toggleDarkMode",
    function () {
      mainChatPanel.webview.postMessage({ command: "toggleDarkMode" });
    }
  );
  context.subscriptions.push(toggleDarkMode);

  let suggestImprovement = vscode.commands.registerCommand(
    "code-gpt.suggestImprovement",

    async function () {
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!mainChatPanel) {
        vscode.commands.executeCommand("code-gpt.showChatPanel");
      } else {
        mainChatPanel.reveal(vscode.ViewColumn.One);
      }

      var completion_prompt =
        "Suggest improvements for the following code. Be concise. \n";
      const response = await callGPT(`${completion_prompt} ${selectedText}`);

      postChatResponse(response);
    }
  );
  context.subscriptions.push(suggestImprovement);

  async function postChatResponse(response) {
    mainChatPanel.webview.postMessage({
      command: "gptResponse",
      response: response,
    });
  }
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

  if (completion) {
    const assistant_reply = completion.data.choices[0].message.content;
    messages.push({ role: "assistant", content: assistant_reply });
    return assistant_reply;
  } else {
    console.log("Likely error with OpenAI API");
    return undefined;
  }
}

// Render webview
function getWebviewContent(webview) {
  const chatHTMLPath = path.join(__dirname, "webview", "chat.html");
  const handlersPath = path.join(__dirname, "src", "handlers.js");
  const stylesPath = path.join(__dirname, "src", "styles", "chat.css");

  const handlersURI = webview.asWebviewUri(vscode.Uri.file(handlersPath));
  const stylesURI = webview.asWebviewUri(vscode.Uri.file(stylesPath));

  let HTMLContent = fs.readFileSync(chatHTMLPath, "utf8");
  HTMLContent = HTMLContent.replace("%handlers%", handlersURI);
  HTMLContent = HTMLContent.replace("%styles%", stylesURI);

  return HTMLContent;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
