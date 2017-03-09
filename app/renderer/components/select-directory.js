let Vue = require('vue');

Vue.component('select-directory', {
    template: '<div class="upload-browse" @click="selectDirectory($event)"><input type="file" style="display: none;" @change="onChange($event)" webkitdirectory><slot></slot></div>',
    props: ['directorySelected'],
    methods: {
        selectDirectory: function(event) {
            let fileInput = this.$el.querySelector('input[type=file]');
            if (!fileInput)
                return;

            fileInput.style.opacity = 0;
            fileInput.style.display = 'block';
            fileInput.focus();
            fileInput.click();
            fileInput.style.display = 'none';
        },
        onChange: function(event) {
            if (event.target.files && event.target.files.length > 0 && this.directorySelected) {
                this.directorySelected(event.target.files[0].path);
                event.target.value = '';
            }
        }
    }
});