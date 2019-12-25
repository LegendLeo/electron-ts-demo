import { ipcRenderer } from 'electron'
import { $ } from '../utils'

$('btn-add-music').addEventListener('click', () => {
  ipcRenderer.send('addMusicWindow', () => {

  })
})
