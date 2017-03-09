let fs = require('fs');
let Vue = require('vue');
let Template = require('../template/template').Template;
let archiver = require('archiver');
let localForage = require('localforage');
let _ = require('lodash');

let {UiButton, UiIconButton, UiConfirm, UiSnackbarContainer} = require('keen-ui');
require('../components/upload-components');
require('../components/select-directory');
require('./upload-image-dialog.js');
require('./import-templates-dialog.js');


let MENU_ADD_TEMPLATE_ID = 'add-template';

Vue.component('md-email-editor', {
    components: { UiButton: UiButton, UiIconButton: UiIconButton, UiConfirm: UiConfirm, UiSnackbarContainer: UiSnackbarContainer },
    template: fs.readFileSync(__dirname + '/md-email-editor.html', 'utf8'),
    data: () => {
        let data = {
            templates: [],
            curTemplate: null,
            mdText: '',
            imageDialogDisplaying: false,
            importDialogDisplaying: false,
            requireImport: false,
            insertedImages: {},
            deleteTemplateDialog: {
                show: false,
                template: null
            }
        };
        return data;
    },
    methods: {
        newFile: function(event) {
            this.mdText = '';
        },
        showImageDialog: function(event) {
            this.imageDialogDisplaying = true;
        },
        imagesSelected: function(files) {
            let textAreaElm = this.$el.querySelector('textarea');
            let sectionStart = textAreaElm.selectionStart;
            let imageTexts = '\n\n';
            let promises = [];
            Array.prototype.forEach.call(files, (file) => {
                imageTexts += '![' + file.name + '](img/' + file.name + ')\n\n';

                promises.push(new Promise((resolve, reject) => {
                    let fileReader = new FileReader();
                    fileReader.onload = (event) => {
                        this.insertedImages['img/' + file.name] = fileReader.result;
                        resolve();
                    };
                    fileReader.readAsDataURL(file);
                }));
            });
            this.mdText = this.mdText.substring(0, sectionStart) + imageTexts + this.mdText.substring(sectionStart);
            this.imageDialogDisplaying = false;

            Promise.all(promises).then(() => {
                this.updatePreviewWebview();
            });
        },
        importNewTemplate: function(template) {
            let savedTemplate = new Template(template.id, template.name, template.container, template.h1, template.h2, template.image, template.paragraph);
            this.templates.push(savedTemplate);
            this.curTemplate = savedTemplate;
            localForage.setItem('templates', this.templates).then(() => {
                this.importDialogDisplaying = false;
                this.updatePreviewWebview();
            }).catch((err) => {
                console.log(err);
            });
        },
        exportEmail: function(outputPath) {
            let output = fs.createWriteStream(outputPath + '/email.zip');
            output.on('close', () => {
                this.$broadcast('ui-snackbar::create', {
                    message: 'Email has been exported to ' + outputPath  + '/email.zip successfully.',
                    duration: 3000
                });
            });

            let outputZip = archiver.create('zip');
            outputZip.on('error', (err) => {
                this.$broadcast('ui-snackbar::create', {
                    message: 'Unexpected error when archiving email files.',
                    duration: 3000 
                });
            });
            outputZip.pipe(output);

            outputZip.append(this.curTemplate.render(this.mdText), { name: 'email.html' });
            for (let filename in this.insertedImages) {
                outputZip.append(this.insertedImages[filename], { name: filename });
            }
            outputZip.finalize();
        },
        updatePreviewWebview: function() {
            if (!this.curTemplate)
                return;
            let webview = this.$el.getElementsByTagName('webview')[0];
            if (!this.mdText || this.mdText === '')
                webview.send('reload-preview', '');

            // Send reload message to the preview renderer.
            let renderedHTML = this.curTemplate.render(this.mdText, this.insertedImages);
            webview.send('reload-preview', renderedHTML);
        },
        addNewTemplate: function() {
            this.$broadcast('ui-dropdown::close');
            this.importDialogDisplaying = true;
        },
        templateSelected: function(template) {
            this.$broadcast('ui-dropdown::close');
            this.curTemplate = template;
            localForage.setItem('currentTemplateId', this.curTemplate.id);
            this.updatePreviewWebview();
        },
        confirmDeleteTemplate: function(template) {
            this.$broadcast('ui-dropdown::close');
            this.deleteTemplateDialog.show = true;
            this.deleteTemplateDialog.template = template;
        },
        deleteTemplate: function() {
            this.templates.$remove(this.deleteTemplateDialog.template);
            localForage.setItem('templates', this.templates).then(() => {
                if (this.deleteTemplateDialog.template.id === this.curTemplate.id) {
                    this.$set('curTemplate', this.templates[0]);
                    this.updatePreviewWebview();
                }
                this.deleteTemplateDialog.show = false;
                this.deleteTemplateDialog.template = null;
            }).catch((err) => { console.log(err); });
        }
    },
    ready: function(event) {
        Promise.all([localForage.getItem('templates'), localForage.getItem('currentTemplateId')])
            .then((results) => {
                let resultTemplates = results[0];
                let currentTemplateId = results[1];
                Vue.nextTick(() => {
                    if (!resultTemplates) {
                        setTimeout(() => {
                            this.importDialogDisplaying = true;
                            this.requireImport = true;
                        }, 300);
                        return;
                    }

                    setTimeout(() => {
                        this.templates = resultTemplates.map((cacheTemp) => {
                            return new Template(cacheTemp.id, cacheTemp.name, cacheTemp.container, cacheTemp.h1, cacheTemp.h2,
                                cacheTemp.image, cacheTemp.paragraph);
                        });

                        let curTemplate = null;
                        if (!!currentTemplateId) {
                            curTemplate = _.find(this.templates, { id: currentTemplateId });
                        }
                        this.curTemplate = curTemplate || this.templates[0];
                        this.updatePreviewWebview();
                    }, 300);
                });
            }).catch((err) => {
                console.log(err);
            });

        let webview = this.$el.getElementsByTagName('webview')[0];
        webview.addEventListener('dom-ready', (evt) => {
            this.updatePreviewWebview();
        });
    },
    watch: {
        mdText: function(val) {
            this.updatePreviewWebview();
        }
    }
});