## Logseq Pomodoro Improved

Info about the Pomodoro Technique [here](https://en.wikipedia.org/wiki/Pomodoro_Technique).

A light update to the Logseq team's original Pomodoro timer, with adjustable lengths of time and a bell at the end of the session.

To create a pomodoro with default 25 minute time, type `\Pomodoro` 

To change the time, adjust the number at the end of the block's macro, eg `{{renderer :pomodoro_fdcfd adjust_this_number}}`
### API

[![npm version](https://badge.fury.io/js/%40logseq%2Flibs.svg)](https://badge.fury.io/js/%40logseq%2Flibs)

##### Logseq.App

- `registerSlashCommand: (tag: string, action: BlockCommandCallback | Array<SlashCommandAction>) => boolean`
- `onMacroRendererSlotted: IUserSlotHook<{ payload: { arguments: Array<string>, uuid: string, [key: string]: any } }>`

> ⚠️ The current implementation may have performance issues,
> especially when there are too many running timer instances.
> That's because time ticker needs to message frequently between
> the host and the plugin sandbox. We are exploring better solutions for
> the rendering of block content.
 
### Running the Sample

> 🏷 Minimal version of App [0.4.6](https://github.com/logseq/logseq/releases/tag/0.4.6) !
 
- `yarn && yarn build` or `npm install && npm run build` in the terminal to install dependencies.
- `Load unpacked plugin` in Logseq Desktop client.
- Restart Logseq to take effect.

Sometimes the slash command doesn't appear after installation unless you quit Logseq and reopen it.

### License
MIT
