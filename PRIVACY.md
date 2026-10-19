# Privacy

Script Room is a single web page. It has no accounts and no analytics. The only thing the site stores is a project you choose to share.

**Your projects** are saved in your browser on your device (local storage). Nobody else can see them, including the people who run the site. Clearing your browser data deletes them, so keep a project file for anything important (Save, then Save project file).

**AI features** (suggestions, writing, importing a book, analysing a photo) send the text or image you are working on to the AI provider you connected, under your own account with that provider and its terms. Script Room never sees that account.

- Your API key is kept in this browser only, and only if you tick *Remember*. Otherwise it lasts until you close the tab.
- Some providers block calls made straight from a browser. For those, the request goes through this site's relay (`/api/ai`). The relay forwards the request to the provider you chose and streams the answer back. It stores nothing and logs nothing, and it only talks to a fixed list of AI providers.
- A local model (Ollama, LM Studio) runs on your own computer. Requests go straight from your browser to it and never leave your machine.

**Write together and view links.** When you press Share, a copy of that one project is stored on the site (Cloudflare KV) so the people you send a link to can open it. The links contain long random keys. The site stores only a hash of each key, so it cannot read the links back or rebuild them. Anyone who has a link can open the project (view link) or change it (edit link), so share them like a password. **Stop sharing** deletes the stored copy at once; links then stop working.

**Images.** When you generate an image, the prompt (and, for models that use references, the character photos you chose) goes to the image service you picked: this site's free model runs on Cloudflare Workers AI; Pollinations is a separate free service at pollinations.ai; Google, OpenAI, OpenRouter and fal.ai use your own key and account. Images you upload stay in your browser unless you send them to a model.

**Prompts you copy** go wherever you paste them. Script Room never connects to your video accounts.

**Webhook.** If you set a webhook address in the Shots step, your shot list is sent to that address when you press Send. Only use an address you control.
