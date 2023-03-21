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

/*
 * ON THE MESSAGES ARRAY:
 *   The system message prepares the model for completions. Note that you can also
 *   add your own "assistant" replies in the starting messages array to help show
 *   the model what desireable behavior looks like.
 */

let messages = [
  { role: "system", content: "You are a helpful assistant.", time: newDate() },
];

let darkMode = false;

window.addEventListener("DOMContentLoaded", () => {
  const promptArea = document.getElementById("inputMessage");
  const messagesContainer = document.getElementById("chat");
  updateChatWindow(messagesContainer);

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
      showTypingIndicator();

      inputMessage.value = "";
      vscode.setState({ messages: messages, mode: darkMode });
      scrollToBottom(messagesContainer);
    }
  });

  // Handle webview postMessage calls
  window.addEventListener("message", (event) => {
    const message = event.data;

    switch (message.command) {
      case "gptResponse":
        const content = message.response.content;
        const newMess = {
          role: "assistant",
          content: content,
          time: newDate(),
        };
        messages.push(newMess);

        removeTypingIndicator();
        createChatBlurb(newMess);
        scrollToBottom(messagesContainer);
        vscode.setState({ messages: messages, mode: darkMode });
        break;

      case "toggleDarkMode":
        toggleDarkMode(messagesContainer);
        break;
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
      mess.content,
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

function updateChatWindow(messagesContainer) {
  const state = vscode.getState();
  if (state) {
    const messageHistory = state.messages.slice(1);

    for (var mess of messageHistory) {
      messages.push(mess);
      createChatBlurb(mess);
    }

    if (state.mode) {
      // mode = true means user was last seen in dark mode
      toggleDarkMode(messagesContainer);
    }
  }
}

function scrollToBottom(element) {
  const start = element.scrollTop;
  const end = element.scrollHeight - element.clientHeight;
  const change = end - start;
  const duration = 500; // duration of the smooth scrolling, in milliseconds
  let startTime = null;

  function animateScroll(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = currentTime - startTime;
    const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t); // easeInOutQuad easing function
    const amountScrolled = ease(progress / duration) * change;

    element.scrollTop = start + amountScrolled;

    if (progress < duration) {
      window.requestAnimationFrame(animateScroll);
    }
  }

  window.requestAnimationFrame(animateScroll);
}

function showTypingIndicator() {
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message typing-indicator-container";
  typingIndicator.setAttribute("id", "typingIndicator");

  const messageHeader = document.createElement("div");
  messageHeader.className = "message-header";

  const messageRole = document.createElement("span");
  messageRole.className = "message-role";
  messageRole.textContent = "Assistant";

  const messageTime = document.createElement("span");
  messageTime.className = "message-time";
  messageTime.textContent = "...";

  const messageContainer = document.createElement("div");
  messageContainer.className = "message-content";

  const dot1 = document.createElement("span");
  dot1.className = "typing-indicator";
  dot1.style.animationDelay = "0s";
  const dot2 = document.createElement("span");
  dot2.className = "typing-indicator";
  dot2.style.animationDelay = "0.2s";
  const dot3 = document.createElement("span");
  dot3.className = "typing-indicator";
  dot3.style.animationDelay = "0.4s";

  messageContainer.appendChild(dot1);
  messageContainer.appendChild(dot2);
  messageContainer.appendChild(dot3);

  messageHeader.appendChild(messageRole);
  messageHeader.appendChild(messageTime);
  typingIndicator.appendChild(messageHeader);
  typingIndicator.appendChild(messageContainer);

  const messagesContainer = document.getElementById("chat-messages");
  messagesContainer.appendChild(typingIndicator);
  scrollToBottom(messagesContainer);
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function toggleDarkMode(messagesContainer) {
  messagesContainer.classList.toggle("dark");
  darkMode = !darkMode;
  vscode.setState({ messages: messages, mode: darkMode });
}
