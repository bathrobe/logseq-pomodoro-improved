import '@logseq/libs'
const fs = require('fs');

/**
 * main entry
 */
async function main () {

  const genRandomStr = () => Math.random().
    toString(36).
    replace(/[^a-z]+/g, '').
    substr(0, 5)

  // models
  logseq.provideModel({
    async startPomoTimer (e: any) {
      const { pomoId, slotId, blockUuid, durationMins } = e.dataset
      const startTime = Date.now()

      const block = await logseq.Editor.getBlock(blockUuid)
      const flag = `{{renderer :pomodoro_${pomoId} ${durationMins}`
      const newContent = block?.content?.replace(`${flag}}}`,
        `${flag},${startTime}}}`)
      if (!newContent) return
      await logseq.Editor.updateBlock(blockUuid, newContent)
      renderTimer({ pomoId, slotId, startTime })
    },
  })

  logseq.provideStyle(`
    .pomodoro-timer-btn {
       border: 1px solid var(--ls-border-color); 
       white-space: initial; 
       padding: 3px 4px; 
       border-radius: 4px; 
       user-select: none;
       cursor: default;
       display: flex;
       align-content: center;
    }
    
    .pomodoro-timer-btn.is-start:hover {
      opacity: .8;
    }
    
    .pomodoro-timer-btn.is-start:active {
      opacity: .6;
    }
    
    .pomodoro-timer-btn.is-start {
      padding: 3px 6px;
      cursor: pointer;
    }
    
    .pomodoro-timer-btn.is-pending {
      padding-left: 6px;
      width: 84px;
      background-color: #f6dbdb;
      border-color: #edbdbd;
      color: #cd3838;
    }
    
    .pomodoro-timer-btn.is-done {
      width: auto;
      background-color: #defcf0;
      border-color: #9ddbc7;
      color: #0F9960;
    }
  `)

  // entries
  logseq.Editor.registerSlashCommand('🍅 Pomodoro Timer', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :pomodoro_${genRandomStr()} 25}} `,
    )
  })

  /**
   * @param pomoId
   * @param slotId
   * @param startTime
   * @param durationMins
   */
  function renderTimer ({
    pomoId, slotId,
    startTime, durationMins,
  }: any) {
    if (!startTime) return
    const durationTime = (durationMins || 25) * 60

    const keepKey = `${pomoId}-${slotId}-${logseq.baseInfo.id}`
    const keepOrNot = () => logseq.App.queryElementById(keepKey)

    function _render (init: boolean) {
      let bell = new Audio('../bell.flac')
      bell.volume = 0.5
      const nowTime = Date.now()
      const offsetTime = Math.floor((nowTime - startTime) / 1000)
      const isDone = durationTime < offsetTime
      if(durationTime === offsetTime){
        bell.play()
      }
      const humanTime = () => {
        const offset = durationTime - offsetTime
        const minus = Math.floor(offset / 60)
        const secs = offset % 60
        return `${(minus < 10 ? '0' : '') + minus}:${(secs < 10 ? '0' : '') +
        secs}`
      }
      const provideUi = () => logseq.provideUI({
        key: pomoId,
        slot: slotId,
        reset: true,
        template: `
        ${!isDone ?
          `<a class="pomodoro-timer-btn is-pending">
            🍅 ${humanTime()}
          </a>` :
          `<a class="pomodoro-timer-btn is-done">
            🍅 ✅ ${durationMins}
          </a>`
        }
      `,
      })

      Promise.resolve(init || keepOrNot()).then((res) => {
        if (res) {
          provideUi()

          !isDone && setTimeout(() => {
            _render(false)
          }, 1000)
        }
      })
    }

    _render(true)
  }

  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [type, startTime] = payload.arguments
    let durationMins = payload.arguments[0].split(' ')[1]
    if (!type?.startsWith(':pomodoro_')) return
    const identity = type.split('_')[1]?.split(' ')[0].trim()
    if (!identity) return
    const pomoId = 'pomodoro-timer-start_' + identity

    if (!startTime?.trim()) {
      return logseq.provideUI({
        key: pomoId,
        slot, reset: true,
        template: `
          <button
          class="pomodoro-timer-btn is-start"
          data-slot-id="${slot}" 
          data-pomo-id="${identity}"
          data-block-uuid="${payload.uuid}"
          data-duration-mins=${durationMins}
          data-on-click="startPomoTimer">
          🍅 START ${durationMins}
          </button>
        `,
      })
    }

    // reset slot ui
    renderTimer({ pomoId, slotId: slot, startTime, durationMins })
  })
}

// bootstrap
logseq.ready(main).catch(console.error)
