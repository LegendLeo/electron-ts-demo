import { BrowserWindow } from 'electron'
import { basename } from 'path'
import { Track } from './interface'
const Store = require('electron-store')
const uuid = require('uuid/v4')

export function $(str: string): HTMLElement {
  return document.getElementById(str)
}

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

export class DataStore extends Store {
  constructor(options: object) {
    super(options)
    this.tracks = this.getTracks()
  }
  addTracks(tracks: string[]) {
    // 对准备导出的音乐做去重处理，判断文件名是否已经在tracks里
    const tracksWithProps: Track[] = tracks.reduce((total, curTrack) => {
      if (this.tracks.every((item: Track) => item.fileName !== basename(curTrack))) {
        total.push({
          id: uuid(),
          path: curTrack,
          fileName: basename(curTrack)
        })
      }
      return total
    }, [])
    this.tracks = [...this.tracks, ...tracksWithProps]
    return this.saveTracks()
  }
  deleteTracks(id: string) {
    this.tracks = this.tracks.filter((item: Track) => item.id !== id)
    return this.saveTracks()
  }
  getTracks() {
    return this.get('tracks') || []
  }
  saveTracks() {
    this.set('tracks', this.tracks)
    return this
  }
}
