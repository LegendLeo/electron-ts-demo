import { ipcRenderer } from 'electron'
import { $ } from '../utils'
import { Track } from '../utils/interface'

let allTracks: Track[] = []
let musicAudio: HTMLAudioElement = new Audio()
let curTrack: Track

$('btn-add-music').addEventListener('click', () => {
  ipcRenderer.send('addMusicWindow', () => {})
})

// 渲染音乐列表
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

// 为了性能，使用了冒泡的原理将时间绑定在父级元素，判断点击的元素，分别做不同处理
$('tracksList').addEventListener('click', (event: MouseEvent) => {
  event.preventDefault()
  if (event.target instanceof HTMLElement) {
    const { dataset, classList } = event.target
    const id = dataset && dataset.id
    if (id) {
      // 如果点击的是播放
      if (classList.contains('fa-play')) {
        if($('progress').hidden) {
          $('progress').removeAttribute('hidden')
        }
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
        // 如果点击的是暂停，暂停音乐播放，切换按钮
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
      } else if (classList.contains('fa-trash-alt')) {
        // 如果点击的是删除，发送删除音乐事件
        ipcRenderer.send('deleteMusic', id)
      }
    }
  }
})

// 转化时间
const formatTime = (time: number) => {
  let min = '' + Math.floor(time / 60)
  min = min.padStart(2, '0')
  let sec = '' + Math.floor(time % 60)
  sec = sec.padStart(2, '0')
  return `${min}:${sec}`
}

// 渲染音乐播放器
const renderMusicPlayer = (name: string, duration: number): void => {
  $('player-status').innerHTML = `<div class="col-8 font-weight-bold">
      正在播放：${name}
    </div>
    <div class="col-4">
      <span id="current-seeker">00:00</span> / ${formatTime(duration)}
    </div>`
}

// 监听加载音乐事件，加载音乐同时渲染音乐文件名和时间
musicAudio.addEventListener('loadedmetadata', () => {
  renderMusicPlayer(curTrack.fileName, musicAudio.duration)
})

// 监听音乐播放时间，处理进度条
musicAudio.addEventListener('timeupdate', () => {
  $('current-seeker').innerHTML = formatTime(musicAudio.currentTime)
  let progress = (musicAudio.currentTime / musicAudio.duration) * 100
  $('player-progress').style.width = progress + '%'
})

// 点击进度条进到相应的播放进度
$('progress').addEventListener('click', (event: MouseEvent) => {
  if (!curTrack) return
  const fullProgress = $('progress').clientWidth
  let progress = event.offsetX / fullProgress
  musicAudio.currentTime = progress * musicAudio.duration
})
