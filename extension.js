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
                const messageHistory = message.history;
                const messageTime = message.time;
                const response = await callGPT(messageHistory, messageTime);
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

// Render webview
function getWebviewContent(webview, messageHistory) {
  const chatHTMLPath = path.join(__dirname, "webview", "chat.html");
  const handlersPath = path.join(__dirname, "src", "handlers.js");
  const stylesPath = path.join(__dirname, "src", "styles", "chat.css");

  const handlersURI = webview.asWebviewUri(vscode.Uri.file(handlersPath));
  const stylesURI = webview.asWebviewUri(vscode.Uri.file(stylesPath));

  let HTMLContent = fs.readFileSync(chatHTMLPath, "utf8");
  HTMLContent = HTMLContent.replace("%handlers%", handlersURI);
  HTMLContent = HTMLContent.replace("%styles%", stylesURI);

  if (messageHistory) {
    HTMLContent = HTMLContent.replace(
      "%chatHistory%",
      messageHistory.messageHistory
    );
  } else {
    HTMLContent = HTMLContent.replace("%chatHistory%", "");
  }

  return HTMLContent;
}

async function callGPT(messages, time) {
  // Remove the timestamp from each message, as OpenAI API
  // Will not accept it in the messages param
  // Note: It will be retained in handlers.js so
  // messages have timestamps.

  messages.map((element) => {
    delete element.time;
    return element;
  });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  let assistant_message = {
    role: "assistant",
    content: completion.data.choices[0].message.content.toString(),
    time: time,
  };

  return assistant_message;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
