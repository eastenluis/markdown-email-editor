# Markdown Email Editor

This is a simple email editing tool (based on [Electron](https://github.com/electron/electron) and [Vue.js 1.x](https://vuejs.org/)) that imports email template and converts Markdown text into HTML file. I wrote this to simplify 
the process of composing different campaign emails and unifying email styles composed by different writers.

## Build

### Development
To install required packages, ensure that you run `npm install` in both the root directory (for build tools) and `/app` directory (for app dependencies). Type 
`npm start` in the root level to run the app.

### Package
I use [electron-packager](https://github.com/electron-userland/electron-packager) to package the tool. Type `npm run pack-mac` to package for mac and `npm run pack-win` for Windows 32/64bit.

## Template

Template will define how some of the Markdown elements should be presented in the output email. Currently it only supports **paragraph**, **header 1**, **header 2** and **image**. Notice that the template follows the syntax of [mustache](https://github.com/janl/mustache.js), so `{{{` and `}}}` indicates variables that are rendered as unescaped HTML, and `{{` and `}}` indicates variables that are rendered as HTML-escaped.

### 1. container.html

This should include root-level `html`, `head` and `body` tags. You can define the styles in `head` tag, and the editor will use [Juice](https://github.com/Automattic/juice) to inline your css properties into applicable tags. The template should include `{{{ content }}}` to indicate where you want to place the generated HTML content. See [this example](misc/example-template/container.html).

### 2. paragraph.html

This defines how **paragraph** content should be presented. It requires `{{{ content }}}`/`{{ content }}` to indicate where you want to place the paragraph text. See [this example](misc/example-template/paragraph.html).

### 3. h1.html, h2.html

These defines how **header 1**, **header 2** text should be presented. They requires `{{{ headerText }}}`/`{{ headerText}}` indicate where you want to place the header text. See these examples ([h1](misc/example-template/h1.html), [h2](misc/example-template/h2.html))

### 4. image.html

This defines how **image** should be presented. It requires `{{ imageSrc }}` to indicate the image source url. See [this example](misc/example-template/image.html).