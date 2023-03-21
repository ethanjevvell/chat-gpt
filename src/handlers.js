let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const vscode = acquireVsCodeApi();

const messages = [
  { role: "system", content: "You are a helpful assistant.", time: newDate() },
];

window.addEventListener("DOMContentLoaded", () => {
  updateChatWindow();
  const promptArea = document.getElementById("inputMessage");
  const messagesContainer = document.getElementById("chat");

  // Press enter key
  promptArea.addEventListener("keydown", (event) => {
    if (event.code === "Enter") {
      const inputMessage = document.getElementById("inputMessage");
      const content = inputMessage.value;
      const message = { role: "user", content: content, time: newDate() };
      messages.push(message);
      createChatBlurb(message);

      // Send a message to the extension to call GPT
      // const assistant_message = callGPT(content);
      vscode.postMessage({
        command: "callGPT",
        history: messages,
        time: message.time,
      });

      inputMessage.value = "";
    }
  });

  // Handle webview postMessage calls
  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "gptResponse":
        const content = message.response.content;
        const newMess = { role: "GPT", content: content, time: newDate() };
        createChatBlurb(newMess);
        break;

      case "toggleDarkMode":
        messagesContainer.classList.toggle("dark");
        break;

      case "refreshWebview":
        for (var mess in messages) {
          createChatBlurb(mess);
        }
    }
  });
});

function createChatBlurb(mess) {
  let messagesContainer = document.getElementById("chat-messages");

  const message = document.createElement("div");
  message.className = "message";

  const messageHeader = document.createElement("div");
  messageHeader.className = "message-header";

  const messageRole = document.createElement("span");
  messageRole.className = "message-role";
  messageRole.textContent = mess.role === "user" ? "User" : "Assistant";

  const messageTime = document.createElement("span");
  messageTime.className = "message-time";
  messageTime.textContent = mess.time;

  const messageContainer = document.createElement("div");
  messageContainer.className = "message-content";

  // Check if the response contains code
  const codePattern = /```([\s\S]*?)```/g;
  const codeMatches = mess.content.match(codePattern);

  if (mess.content.match(codePattern) !== null) {
    messageContainer.innerHTML = processContentForCode(
      mess.contentcontent,
      codeMatches
    );
  } else {
    messageContainer.textContent = mess.content;
  }

  messageHeader.appendChild(messageRole);
  messageHeader.appendChild(messageTime);
  message.appendChild(messageHeader);
  message.appendChild(messageContainer);
  messagesContainer.appendChild(message);

  return messagesContainer;
}

function newDate() {
  let rawDate = new Date();

  let month = months[rawDate.getMonth()];
  let day = rawDate.getDate();
  let year = rawDate.getFullYear();
  let hours = rawDate.getHours();
  let minutes = rawDate.getMinutes();
  let ampm = hours >= 12 ? "p.m." : "a.m.";

  hours = hours >= 13 ? hours - 12 : hours;
  return `${month} ${day}, ${year} @ ${hours}:${minutes}${ampm}`;
}

function processContentForCode(content, codeMatches) {
  let processedContent = content;

  for (const codeMatch of codeMatches) {
    const codeSnippet = codeMatch.slice(3, -3); // Remove the ``` markers
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = codeSnippet;
    pre.appendChild(code);

    hljs.highlightBlock(code);

    // Replace the matched code block with a placeholder
    const placeholder = `@@@CODE_BLOCK_${Math.random()
      .toString(36)
      .substr(2, 9)}@@@`;
    processedContent = processedContent.replace(codeMatch, placeholder);

    // Add the code block to the message container
    processedContent = processedContent.split(placeholder).join(pre.outerHTML);
  }

  return processedContent;
}

function updateChatWindow() {
  if (vscode.getState()) {
    let hasMessages = vscode.getState().messageHistory;
    vscode.postMessage({
      command: "refreshWebview",
    });
  }
}
