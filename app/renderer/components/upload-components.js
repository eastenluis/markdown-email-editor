let Vue = require('vue');

Vue.component('upload-browse', {
    template: '<div class="upload-browse" @click="selectFile($event)"><input type="file" style="display: none;" @change="onChange($event)" :accept="accept" multiple><slot></slot></div>',
    props: ['fileSelected', 'accept'],
    methods: {
        selectFile: function(event) {
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
            if (event.target.files && this.fileSelected) {
                this.fileSelected(event.target.files);
            }
        }
    }
});

function isDragDataFile(/** DataTransfer */ dataTransfer, acceptedTypes) {
    // dataTransfer.types in IE11 is not an Array object, and it does not have method indexOf. Has to
    // use loop to access instead.
    let isFile = false;
    if (dataTransfer && dataTransfer.types) {
        isFile = Array.prototype.some.call(dataTransfer.types, (type) => {
            return type === 'Files';
        });
    }
    if (isFile && dataTransfer.files && acceptedTypes) {
        return Array.prototype.every.call(dataTransfer.files, (file) => {
            return acceptedTypes.indexOf(file.type) >= 0;
        });
    }
    return false;
}

Vue.component('file-drop', {
    template: '<div class="file-drop"' +
    '@dragover="onDragover($event)"' +
    '@dragleave="onDragleave($event)"' +
    '@dragenter="onDragenter($event)"' +
    '@drop="onDrop($event)"><slot></sloc></div>',
    props: ['fileSelected', 'acceptTypes'],
    data: function() {
        return { dragCount: 0 };
    },
    methods: {
        onDragenter: function(event) {
            if (!isDragDataFile(event.dataTransfer, this.acceptTypes)) 
                return;

            this.dragCount++;
            if (this.dragCount > 0)
                this.$el.classList.add('dragover');
            event.dataTransfer.dropEffect = 'copy';
        },
        onDragover: function(event) {
            if (!isDragDataFile(event.dataTransfer, this.acceptTypes))
                return;
            event.dataTransfer.dropEffect = 'copy';
        },
        onDragleave: function(event) {
            if (!isDragDataFile(event.dataTransfer, this.acceptTypes))
                return;

            this.dragCount--;
            if (this.dragCount <= 0)
                this.$el.classList.remove('dragover');
            event.preventDefault();
        },
        onDrop: function(event) {
            if (!isDragDataFile(event.dataTransfer, this.acceptTypes))
                return;

            if (event.dataTransfer && event.dataTransfer.files && this.fileSelected) {
                event.stopPropagation();
                event.preventDefault();
                this.fileSelected(event.dataTransfer.files);
            }
        }
    }
});
