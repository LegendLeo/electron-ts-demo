import { BrowserWindow } from 'electron'

export function $(str: string): HTMLElement {
  return document.getElementById(str)
}

// 因为BrowserWindow不支持继承，封装类的方法被弃用
// export class AppWindow extends BrowserWindow {
//   constructor(
//     templateLocation: string,
//     config?: Electron.BrowserWindowConstructorOptions
//   ) {
//     const baseConfig = {
//       width: 800,
//       height: 600,
//       webPreferences: {
//         nodeIntegration: true
//       }
//     }
//     const finalConfig = { ...baseConfig, ...config }
//     super(finalConfig)
//     this.loadURL('file://' + templateLocation)
//     this.once('ready-to-show', () => {
//       this.show()
//     })
//   }
// }

/**
 * 创建窗口
 * @param templateLocation 模板位置
 * @param config 配置项
 */
export function createWindow(
  templateLocation: string,
  config?: Electron.BrowserWindowConstructorOptions
): Electron.BrowserWindow {
  const baseConfig = {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  }
  let window = new BrowserWindow({ ...baseConfig, ...config })
  window.loadFile(templateLocation)
  window.once('ready-to-show', () => {
    window.show()
  })
  return window
}
