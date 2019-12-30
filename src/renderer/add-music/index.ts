import { ipcRenderer } from 'electron'
import { $ } from '../../utils'
import { basename } from 'path'

let musicFilePaths = []

$('btn-select').addEventListener('click', () => {
  ipcRenderer.send('selectMusic')
})

interface filesObj {
  canceled: string,
  filePaths: string[]
}

ipcRenderer.on('selectedFile', (event, files: filesObj) => {
  let musicListHtml = files.filePaths.reduce((html, music) => {
    return (html += `<li class="list-group-item">${basename(music)}</li>`)
  }, '')
  $('music-list').innerHTML = `
    <ul class="list-group">${musicListHtml}</ul>
  `
  musicFilePaths = files.filePaths
})
