const { ipcRenderer, contextBridge } = require('electron');
const dateFns = require("date-fns");

contextBridge.exposeInMainWorld('electronAPI', {
    ipcRenderer: ipcRenderer,
    dateFns: dateFns
});
