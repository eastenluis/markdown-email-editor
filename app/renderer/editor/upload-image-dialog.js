let fs = require('fs');
let Vue = require('vue');
let {UiModal} = require('keen-ui');

Vue.component('upload-image-dialog', {
    components: {UiModal: UiModal},
    template: fs.readFileSync(__dirname + '/upload-image-dialog.html', 'utf8'),
    props: ['imagesSelected', 'show'],
    data: function() {
        return {
            acceptImgTypes: 'image/*',
            acceptedDropTypes: ['image/bmp', 'image/jpeg', 'image/png', 'image/gif']
        };
    }
});
