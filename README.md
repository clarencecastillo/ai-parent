# AI Parent

[Lab 3] Prolog Assignment for CZ3005 Artificial Intelligence

## Setup

1. Install node.js
2. Install SWI Prolog and make sure it is in your PATH
3. From `ai-parent-web`, run `npm install` to install all dependencies required by the web app
4. From `ai-parent-web`, run `npm run build` to build the application
5. From `ai-parent-server`, run `npm install` to install all dependencies required by the server
5. From `ai-parent-server`, run `npm start` to start the server and launch the web app with the default browser.

## Usage

- When the app is started, choose an item from the left panel to start a conversation
- When first loaded, the application will ask for your name and then prompt you to confirm by submitting `yes`
- For the following prompts, simply enter `yes` or `no` unless told otherwise
- When the conversation is finished, the AI will automatically generate a report which summarises the inputs given
- At any moment after the user's name is given, you can enter `reset` to restart the conversation
- You can also restart all conversations by clicking on the refresh button located at the top left-hand side next to the placeholder 'new' button
