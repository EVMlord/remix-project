import {Plugin} from '@remixproject/engine'
import {SuggestionService, SuggestOptions} from './suggestion-service'
const _paq = (window._paq = window._paq || []) //eslint-disable-line

const profile = {
  name: 'copilot-suggestion',
  displayName: 'copilot-suggestion',
  description: 'copilot-suggestion',
  methods: ['suggest', 'init', 'uninstall', 'status']
}

export class CopilotSuggestion extends Plugin {
  service: SuggestionService
  context: string
  ready: boolean
  constructor() {
    super(profile)
    this.service = new SuggestionService()
    this.context = ''
    this.service.events.on('progress', (data) => {
      this.emit('loading', data)
    })
    this.service.events.on('done', (data) => {
    })
    this.service.events.on('ready', (data) => {
      this.ready = true
    })    
  }

  status () {
    return this.ready
  }

  async suggest(content: string) {
    if (!await this.call('settings', 'get', 'settings/copilot/suggest/activate')) return { output: [{ generated_text: ''}]}

    const max_new_tokens = await this.call('settings', 'get', 'settings/copilot/suggest/max_new_tokens')
    const temperature = await this.call('settings', 'get', 'settings/copilot/suggest/temperature')
    console.log('suggest', max_new_tokens, temperature)
    const options: SuggestOptions = {
      do_sample: false,
      top_k: 0,
      temperature,
      max_new_tokens
    }
    return this.service.suggest(this.context ? this.context + '\n\n' + content : content, options)
  }

  async loadModeContent() {
    let importsContent = ''
    const imports = await this.call('codeParser', 'getImports')
    for (const imp of imports.modules) {
      try {
        importsContent += '\n\n' + (await this.call('contentImport', 'resolve', imp)).content
      } catch (e) {
        console.log(e)
      }      
    }
    return importsContent
  }

  async init() {
    return this.service.init()
  }

  async uninstall() {
    this.service.terminate()
  }
}