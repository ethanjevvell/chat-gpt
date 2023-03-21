# Code-GPT

#### Video Demo: https://youtu.be/a3ck47Jf1oU

#### Description: Code-GPT is a custom extension for VS Code that assists the user with programming tasks.

# Code-GPT

<p>Code-GPT is a Visual Studio Code extension that enables you to chat with OpenAI's GPT-3.5-turbo directly within your editor. It allows you to ask questions, get code suggestions, and receive improvements on your code snippets.</p>

# Features

Chat with GPT-3.5-turbo inside Visual Studio Code.
Toggle dark mode for the chat panel. (ctr+d)
Select a code snippet and ask for suggested improvements.

# Files

extension.js: The main JavaScript file that contains the logic for the extension.
handlers.js: JavaScript file responsible for handling chat UI, message rendering, and communicating with the extension.

# Installation

Configure the extension by adding your OpenAI API key in the settings.

# Usage

Use the code-gpt.showChatPanel command to open the chat panel.
Type your message in the chat panel and press Enter to send it to GPT-3.5-turbo.
Use the code-gpt.toggleDarkMode command to toggle between light and dark mode in the chat panel.
Select a code snippet in your editor and use the code-gpt.suggestImprovement command to receive suggestions for improvements.
