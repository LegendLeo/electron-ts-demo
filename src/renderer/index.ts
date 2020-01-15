import { ipcRenderer } from 'electron'
import { $ } from '../utils'

interface Track {
  fileName: string
  id: string
  path: string
}

let allTracks: Track[] = []
let musicAudio: HTMLAudioElement = new Audio()
let curTrack: Track

$('btn-add-music').addEventListener('click', () => {
  ipcRenderer.send('addMusicWindow', () => {})
})

const renderTrackList = (tracks: Track[]): void => {
  const emptyHtml = '<div class="alert alert-primary">还没有添加任何音乐</div>'
  const listHtml = tracks.reduce((html, track) => {
    html += `<li class="music-track list-group-item d-flex justify-content-between align-items-center row">
      <div class="col-10">
        <i class="fas fa-music mr-2 text-secondary"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-2">
        <i class="fas fa-play mr-3" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt" data-id="${track.id}"></i>
      </div>
    </li>`
    return html
  }, '')
  $('tracksList').innerHTML = tracks.length
    ? `<ul class="list-group">${listHtml}</ul>`
    : emptyHtml
}

ipcRenderer.on('getTracks', (event, tracks: Track[]) => {
  allTracks = tracks
  renderTrackList(tracks)
})

$('tracksList').addEventListener('click', (event: MouseEvent) => {
  event.preventDefault()
  if (event.target instanceof HTMLElement) {
    const { dataset, classList } = event.target
    const id = dataset && dataset.id
    if (id) {
      if (classList.contains('fa-play')) {
        if (curTrack && curTrack.id === id) {
          // 如果点击的是之前播放的，直接继续播放
          musicAudio.play()
        } else {
          // 如果点击的是另外一首，还原之前点击的项目状态
          curTrack = allTracks.find(item => item.id === id)
          let ele = document.querySelector('.fa-pause')
          if (ele) {
            ele.classList.replace('fa-pause', 'fa-play')
          }
          musicAudio.src = curTrack.path
          musicAudio.play()
        }
        // 转换播放状态
        classList.replace('fa-play', 'fa-pause')
      } else if (classList.contains('fa-pause')) {
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
      } else if (classList.contains('fa-trash-alt')) {
        // 发送删除音乐事件
      }
    }
  }
})
