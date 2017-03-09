const {ipcRenderer} = require('electron');

ipcRenderer.on('reload-preview', (event, renderedHTML) => {
    document.body.innerHTML = renderedHTML;
});
