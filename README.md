# Code-GPT: AI-Powered Programming Assistant for VS Code

#### Video Demo: https://youtu.be/a3ck47Jf1oU

#### Description: Code-GPT is a custom extension for Visual Studio Code that integrates an AI programming assistant into your development environment. Powered by OpenAI's GPT-3.5-turbo, this extension aims to provide real-time support and educational guidance during the coding process, streamlining the overall development experience.

## Overview

Code-GPT is an innovative Visual Studio Code extension that brings the power of OpenAI's GPT-3.5-turbo directly into your editor. This AI-powered assistant helps you resolve programming issues, offers code suggestions, and even provides recommendations for improving your code snippets. Designed to cater to both novice and experienced developers, Code-GPT is an essential tool for enhancing productivity and learning in the world of programming.

## Key Features

- Chat with GPT-3.5-turbo inside Visual Studio Code: Access real-time support and ask questions related to programming, code optimization, and problem-solving.
- Toggle dark mode for the chat panel: Easily switch between light and dark mode in the chat panel using the keyboard shortcut (ctrl+d).
- Request code improvements: Select a code snippet within your editor and ask for suggested enhancements, making your code more efficient, readable, and maintainable.

## File Structure

- `extension.js`: The primary JavaScript file that contains the core logic for the Code-GPT extension. It initializes the chat panel, handles communication with GPT-3.5-turbo, and manages extension-related commands.
- `handlers.js`: A supplementary JavaScript file responsible for handling chat UI elements, rendering messages within the chat panel, and facilitating communication between the UI and the main extension.

## Installation and Configuration

1. Install the Code-GPT extension within Visual Studio Code.
2. Configure the extension by adding your OpenAI API key in the settings. This is necessary for enabling communication with GPT-3.5-turbo.

## Usage Instructions

- To open the chat panel, use the `code-gpt.showChatPanel` command, which will allow you to interact with GPT-3.5-turbo.
- Type your message or query in the chat panel and press Enter to send it to GPT-3.5-turbo. The AI assistant will analyze your message and provide relevant feedback or suggestions.
- To toggle between light and dark mode in the chat panel, use the `code-gpt.toggleDarkMode` command.
- To receive suggestions for improving a code snippet, select the code in your editor and use the `code-gpt.suggestImprovement` command. GPT-3.5-turbo will analyze the selected code and provide suggestions for optimization, refactoring, or best practices.

By integrating Code-GPT into your development workflow, you can unlock a more efficient, productive, and educational coding experience. Harness the power of GPT-3.5-turbo to elevate your programming skills and create better software.
