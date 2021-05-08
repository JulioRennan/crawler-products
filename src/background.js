
'use strict'
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const electron = require('electron')

const path = require('path')
const url = require('url')

const fs = require('fs')
const scrap = require('./backend/scrap_markets')
const openurl = require("openurl")
var config_locais = require("../configs.json")
const TelegramBot = require('node-telegram-bot-api');

const token = '1716007865:AAFp7LW4Zi5RASb1EvhBd952WXb0AZNdPds';
var bot_telegram = new TelegramBot(token, { polling: false })

const isDevelopment = process.env.NODE_ENV !== 'production'
var pesquisas = require("../configs.json").pesquisas
var chat_id=require("../configs.json").chat_id
sendTelegram(`Bot esta rodando com as seguintes chaves de pesquisa\n <b> ${pesquisas.join(", ")}</b>`)
sendTelegram(`Fique tranquilo, te aviso se acontecer alguma mudança no seu painel de pesquisas`)
function openNavegador(url) {
  console.log('url acessada:\n' + url + "\n\n")
  openurl.open(url)
}
var win;
async function scrapAllPages(txt) {
  let pipe_line = [scrap.scrapKabumProducts, scrap.scrapTerabyteProducts, scrap.scrapPichauProducts]
  let result = []
  for (let i = 0; i < pipe_line.length; i++) {
    let r = await pipe_line[i](txt);
    result.push(r)
  }
  return result;
}
electron.protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  let display = electron.screen.getAllDisplays();
  win = new BrowserWindow({
    width: 1500,
    height: 1000,    
    x: display[1].bounds.x,
    y: display[1].bounds.y,
    title:"Painel de Produtos",
    webPreferences: {
      preload: path.join(__static,'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: process.env.NODE_ENV !== 'development'
    }
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
ipcMain.on('init', (_) => {
  attPesquisa()
  win.webContents.send("attKeysPesquisa",pesquisas)
})
ipcMain.on("sendTelegram", async (event,message) => {
  sendTelegram(message).then((res) => {
  
  })
})
ipcMain.on('openLink', (event, args) => {
  console.log(args)
  openNavegador(args)
})

ipcMain.on("changePesquisa", async (event, args) => {
  pesquisas = args.data
  if (args.type_op == "add") {
    sendTelegram(`Chave <b>${args.search_key}</b> adicionado a pesquisa!`)
    win.webContents.send("attPesquisa", {
      "search": args.search_key,
      "lista": await scrapAllPages(args.search_key)
    })
  } else {
    sendTelegram(`Chave <b>${args.search_key}</b> removido da pesquisa a pesquisa`)
  }
  config_locais.pesquisas = pesquisas
  fs.writeFileSync("../configs.json",JSON.stringify(config_locais))
  sendTelegram(`Estou pesquisando as chaves: \n<b>${pesquisas.join(", ")}</b>`)
  win.webContents.send("attKeysPesquisa",pesquisas)
})
async function attPesquisa() {
  for (let i = 0; i < pesquisas.length; i++) {
    let lista_produtos_formatados = await scrapAllPages(pesquisas[i])
    win.webContents.send('attPesquisa', {
      'search': pesquisas[i],
      'lista': lista_produtos_formatados.splice(0, 10)
    })
  }
}

async function loop(fn, ms = 5000) {
  let aux_fn = async () => {
    return new Promise((s, r) => {
      setTimeout(async () => {
        await fn()
        s()
      }, ms)
    })
  }
  await aux_fn()
  loop(fn, ms)
}
function applyLoopSearch() {
  loop(async () => {
    console.log('atualizando Lista de pesquisas...')
    await attPesquisa();
    console.log('ja atualizado!\n\n')
  }, 60000)

}
async function sendTelegram(message) {
  return new Promise((s) => {
    console.log(message)
    console.log("++++++++++++++++++++++++")
    bot_telegram.sendMessage(chat_id,message,{parse_mode:"HTML", disable_web_page_preview: true}, (err, message) => {
      if (err) throw err;
      s(message)
    })
  })
}
function loopInfinito(){
  
  try {
    applyLoopSearch();
  } catch (e) {
    console.log(e);
    console.log("reiniciando loop")
    applyLoopSearch();
  }
}
attPesquisa();
loopInfinito();

