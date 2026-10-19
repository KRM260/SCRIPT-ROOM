# Privacy

Script Room is a single web page. It has no accounts, no database and no analytics.

**Your projects** are saved in your browser on your device (local storage). Nobody else can see them, including the people who run the site. Clearing your browser data deletes them, so keep a project file for anything important (Save, then Save project file).

**AI features** (suggestions, writing, importing a book, analysing a photo) send the text or image you are working on to the AI provider you connected, under your own account with that provider and its terms. Script Room never sees that account.

- Your API key is kept in this browser only, and only if you tick *Remember*. Otherwise it lasts until you close the tab.
- Some providers block calls made straight from a browser. For those, the request goes through this site's relay (`/api/ai`). The relay forwards the request to the provider you chose and streams the answer back. It stores nothing and logs nothing, and it only talks to a fixed list of AI providers.
- A local model (Ollama, LM Studio) runs on your own computer. Requests go straight from your browser to it and never leave your machine.

**Write together** works only when the page is opened on claude.ai. A shared project is stored there under a private code; anyone with the code can open and change it, so share the code like a password.

**Prompts you copy** go wherever you paste them. Script Room never connects to your image or video accounts.

**Webhook.** If you set a webhook address in the Shots step, your shot list is sent to that address when you press Send. Only use an address you control.
