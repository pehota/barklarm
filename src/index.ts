import { app, ipcMain } from 'electron';
import { appManager } from './main/AppManager';
import { TrayMenu } from './main/TrayMenu';
import { AppWindow } from './main/AppWindow';
import { ObserverManager } from './main/observers/ObserverManager';
import "./store";
import { NotificationManager } from './main/NotificationManager';
import { dirname, resolve, basename } from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

require('update-electron-app')()
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let updateExePath; 
const appFolder = dirname(process.execPath)
const exeName = basename(process.execPath)
if (process.platform === 'win32')
{
    app.setAppUserModelId(app.name)
    const updateExePath = resolve(appFolder, '..', 'Update.exe')
}

app.setLoginItemSettings({
  openAtLogin: true,
  path: updateExePath,
  args: [
    '--processStart', `"${exeName}"`,
    '--process-start-args', `"--hidden"`
  ]
})

app.on('ready', () => {
  const tray = new TrayMenu()
  const notification = new NotificationManager()
  const observerManager = new ObserverManager(tray, notification)
  observerManager.refershObservers()
  appManager.setTray(tray);
  appManager.setWindow('AppWindow', new AppWindow(MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY));
  ipcMain.on('electron-refresh-observers', () => {
    observerManager.refershObservers()
  });
});

