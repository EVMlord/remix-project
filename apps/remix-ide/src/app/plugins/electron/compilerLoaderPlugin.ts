import { ElectronPlugin } from '@remixproject/engine-electron';

export class compilerLoaderPlugin extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'compilerLoader',
      name: 'compilerloader',
      description: 'Loads the compiler for offline use',
    })
    this.methods = []
    
  }

  onActivation(): void {
    this.on('compilerloader', 'downloadFinished', (path, url) => {
      console.log('downloadFinished', path, url)
      this.call('terminal', 'logHtml', 'Compiler downloaded from ' + url + ' to ' + path)
    })

    this.on('solidity', 'loadingCompiler', async (url) => {
      console.log('loadingCompiler in compilerloader', url, this)
      this.call('terminal', 'logHtml', 'Downloading compiler from ' +  url)
      await this.call('compilerloader', 'downloadCompiler', url)
      const compilerList = await this.call('compilerloader', 'listCompilers')
      console.log('compilerList', compilerList)
      this.emit('compilersDownloaded', compilerList)
    })
  }


}