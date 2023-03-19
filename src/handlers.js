window.addEventListener("DOMContentLoaded", () => {
  const vscode = acquireVsCodeApi();
  const sendButton = document.querySelector("#sendButton");

  sendButton.addEventListener("click", () => {
    const inputMessage = document.getElementById("inputMessage");
    const message = inputMessage.value;

    console.log(message);

    // Send a message to the extension to call GPT
    vscode.postMessage({ command: "callGPT", input: message }, "*");
  });

  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "gptResponse":
        console.log("GPT:", message.response);
        // ... handle the GPT response ...
        break;
      // ... other message handlers ...
    }
  });
});
