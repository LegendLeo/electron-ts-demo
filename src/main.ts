import { app, ipcMain, dialog } from 'electron'
import { createWindow } from './utils'
import { DataStore } from './utils'
import { Track } from './utils/interface'

const dataStore = new DataStore({ name: 'MusicData' })

let mainWindow: Electron.BrowserWindow

// 创建窗口
function initWindow() {
  mainWindow = createWindow('./templates/index.html', {
    width: 1200,
    height: 800
  })

  // 打开控制台
  mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('getTracks', dataStore.getTracks())
    console.log('loaded')
  })
  // 当主窗口关闭触发
  mainWindow.on('closed', () => {
    // 取消引用Window对象，如果你的应用程序支持多窗口，
    // 通常会将窗口存储在一个数组中，此时应该删除相应的元素
    mainWindow = null
  })
}

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。
// 有些接口只有在此事件发生后才能使用
app.on('ready', initWindow)

// 当所有窗口关闭后退出应用
app.on('window-all-closed', () => {
  // 在OSX上，应用以及其工具栏通常会一直保持活跃状态，直到用于通过Cmd + Q退出
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在OSX上，当点击停靠图标并且没有其他窗口打开时，通常需要在应用程序中重新创建窗口
  if (!mainWindow) {
    initWindow()
  }
})

// 接收添加音乐窗口事件
ipcMain.on('addMusicWindow', () => {
  let addMusicWindow = createWindow('./templates/add-music.html')
  addMusicWindow.webContents.openDevTools()
})

ipcMain.on('selectMusic', event => {
  dialog
    .showOpenDialog({
      properties: ['multiSelections', 'openFile'],
      filters: [
        {
          name: 'Music',
          extensions: ['mp3']
        }
      ]
    })
    .then(files => {
      event.sender.send('selectedFile', files)
    })
})

ipcMain.on('addMusic', (event, tracks) => {
  let data: Track[] = dataStore.addTracks(tracks).getTracks()
  mainWindow.webContents.send('getTracks', data)
})

ipcMain.on('deleteMusic', (event, id: string) => {
  const data: Track = dataStore.deleteTracks(id).getTracks()
  mainWindow.webContents.send('getTracks', data)
})
