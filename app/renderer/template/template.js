let Mustache = require('mustache');
let markdown = require('markdown').markdown;
let juice = require('juice');

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

class Template {
    constructor(id, name, container, h1, h2, image, paragraph) {
        this.id = id;
        this.name = name;
        this.container = container;
        this.h1 = h1;
        this.h2 = h2;
        this.image = image;
        this.paragraph = paragraph;
    }
    compileContainer(content) {
        return Mustache.render(this.container, { content: content });
    }
    compileH1(headerText, attrs) {
        return Mustache.render(this.h1, { headerText: headerText, attrs: attrs });
    }
    compileH2(headerText, attrs) {
        return Mustache.render(this.h2, { headerText: headerText, attrs: attrs });
    }
    compileImage(imageSrc, attrs) {
        return Mustache.render(this.image, { imageSrc: imageSrc, attrs: attrs });
    }
    compileParagraph(content, attrs) {
        return Mustache.render(this.paragraph, { content: content, attrs: attrs });
    }

    render(mdText, imagesMap) {
        // Use JsonML HTML tree to render.
        let htmlTree = markdown.toHTMLTree(mdText);
        let content = this.renderTree(htmlTree, 0, imagesMap);
        return juice(content, { preserveImportant: true, removeStyleTags: false });
    }

    renderTree(tree, level, imagesMap) {
        // Following codes use markdown-js/src/render_tree.js as a reference.
        // https://github.com/evilstreak/markdown-js
        if (typeof tree === 'string') {
            return tree;
        }

        let tag = tree.shift(),
            attributes = {},
            content = [];

        if (tree.length && typeof tree[0] === 'object' && !(tree[0] instanceof Array)) {
            attributes = tree.shift();
        }

        while (tree.length) {
            content.push(this.renderTree(tree.shift(), level + 1, imagesMap));
        }

        var tagAttrs = '';
        for (var a in attributes) {
            tagAttrs += ' ' + a + '="' + escapeHTML(attributes[a]) + '"';
        }

        if (tag === 'html')
            return this.compileContainer(content.join(''));
        if (tag === 'h1')
            return this.compileH1(content.join(''), attributes);
        if (tag === 'h2')
            return this.compileH2(content.join(''), attributes);
        if (tag === 'p')
            return this.compileParagraph(content.join(''), attributes);

        if (tag === 'img') {
            let src = attributes['src'];
            if (imagesMap && imagesMap.hasOwnProperty(src))
                return this.compileImage(imagesMap[src], attributes);
            return this.compileImage(src, attributes);
        }

        // Deal with rest of regular elements.
        let innerHTML = tag == 'br' || tag == 'hr' ?
            '<' + tag + tagAttrs + '/>' :
            '<' + tag + tagAttrs + '>' + content.join('') + '</' + tag + '>';
        // Only wraps the root level elements with paragraph template.
        return level === 1 ? this.compileParagraph(innerHTML) : innerHTML;
    }
}
exports.Template = Template;