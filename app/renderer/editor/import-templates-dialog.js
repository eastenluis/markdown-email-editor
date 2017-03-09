let fs = require('fs');
let Vue = require('vue');
let {UiModal} = require('keen-ui');
let uuid = require('node-uuid');

Vue.component('import-templates-dialog', {
    components: { UiModal: UiModal },
    template: fs.readFileSync(__dirname + '/import-templates-dialog.html', 'utf8'),
    props: ['show', 'importNewTemplate', 'requireImport'],
    data: function() {
        return {
            templateName: '',
            template: {}
        };
    },
    methods: {
        importTemplate: function() {
            let newTemplate = { id: uuid.v4(), name: this.templateName };
            Object.assign(newTemplate, this.template);
            this.importNewTemplate(newTemplate);
        },
        cancel: function() {
            this.template = {};
            this.show = false;
        },
        templateSelected: function(templateType, $event) {
            let _this = this;
            let file = $event.target.files[0];
            let reader = new FileReader();
            reader.onload = function() {
                if (this.error)
                    return;

                _this.$set('template.' + templateType, this.result);
            };
            reader.readAsText(file);
        },
        onClose: function() {
            this.$els.templateForm.reset();
        }
    },
    computed: {
        isAllPropertiesFilled: function() {
            if (!this.templateName || this.templateName.length === 0)
                return false;
            if (!this.template.container || !this.template.h1 || !this.template.h2 || !this.template.image || !this.template.paragraph)
                return false;
            return true;
        }
    }
});