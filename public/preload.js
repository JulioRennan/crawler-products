const {
    contextBridge,
    ipcRenderer
} = require("electron");
console.log("alou")
window.ipcRenderer = ipcRenderer
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["changePesquisa","openLink","init","sendTelegram"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["attPesquisa","attKeysPesquisa"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);
