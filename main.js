
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell
const ipc = require('electron').ipcMain
const fs = require('fs')
const os = require('os')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 1400, height: 800, icon: __dirname + "/assets/icons/win/icon.ico" })

    // and load the index.html of tehe app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    var menu = Menu.buildFromTemplate([
        {
            label: 'Options',
            submenu: [
                {
                    label: 'Open Spruce Sales',
                    click() {
                        shell.openExternal('https://sales.sprucefinance.com/customers')
                    }
                },
                {
                    label: 'Open Spruce Tools',
                    click() {
                        shell.openExternal('https://tools.sprucefinance.com')
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click() {
                        app.quit()
                    }
                }
            ]
        },
        {
            label: 'Info',
            submenu: [
                {
                    label: "Dev tools",
                    accelerator: 'F12',
                    click() {
                        win.webContents.openDevTools()
                    }
                }
            ]
        }
    ])

    Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

//If it needs to build a file, most likely won't use at all
// var shella = require('shelljs');
// if (!fs.existsSync(path.join(os.homedir() + "\\Documents\\email-templates\\"))) {
//     //change
//     shella.mkdir('-p', path.join(os.homedir() + "\\Documents\\email-templates\\"));
// }

// for notifications
// app.setAppUserModelId()

ipc.on('update-notify-value', (e, arg) => {
    win.webContents.send('targetPriceVal', arg);
})