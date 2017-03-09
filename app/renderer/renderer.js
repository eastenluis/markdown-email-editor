const {app} = require('electron').remote;
let Vue = require('vue');
let localForage = require('localforage');
let Keen = require('keen-ui');

// Preset localforage config.
localForage.config({
    driver: localForage.INDEXEDDB,
    name: 'EMdMail'
});

// Use keen ui.
Vue.use(Keen);

// Load components.
require('./editor/md-email-editor');

// Prevent accidental file drop which open files in the app.
document.addEventListener('dragover', function(event) {event.preventDefault();});
document.addEventListener('drop', function(event) {event.preventDefault();});

new Vue({
    components: {UiSnackBarContainer: Keen.UiSnackBarContainer},
    el: '#mdEmailEditor'
});
