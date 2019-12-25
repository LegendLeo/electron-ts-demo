import { app, ipcMain, BrowserWindow } from 'electron'
import * as path from 'path'

let mainWindow: Electron.BrowserWindow

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载首页
  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'))

  // 打开控制台
  mainWindow.webContents.openDevTools()

  // 当主窗口关闭触发
  mainWindow.on('closed', () => {
    // 取消引用Window对象，如果你的应用程序支持多窗口，
    // 通常会将窗口存储在一个数组中，此时应该删除相应的元素
    mainWindow = null
  })

  // 接收添加音乐窗口事件
  ipcMain.on('addMusicWindow', createAddMusicWindow)
}

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。
// 有些接口只有在此事件发生后才能使用
app.on('ready', createWindow)

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
    createWindow()
  }
})

function createAddMusicWindow():void {
  let addMusicWindow: Electron.BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  addMusicWindow.loadFile('../src/renderer/add-music/index.html')
}