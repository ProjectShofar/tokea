import type { ApplicationService } from '@adonisjs/core/types'
import SingBoxService from '#services/singbox_service'
import axios from 'axios'
import Setting from '#models/setting'
import app from '@adonisjs/core/services/app'
import fs from 'fs'
export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
  }

  /**
   * The container bindings have booted
   */
  async boot() {
  }

  /**
   * The application has been booted
   */
  async start() {
  }

  /**
   * The process has been started
   */
  async ready() {
    if (this.app.getEnvironment() === 'web') {
      axios.get('https://cloudflare.com/cdn-cgi/trace')
      .then(async res => {
        let ipv4 = '';
        let ipv6 = '';
        const regex = /^(ip|ipv6)=(.+)$/gm;
        let match;
        while ((match = regex.exec(res.data)) !== null) {
          if (match[1] === 'ip') {
            ipv4 = match[2].trim();
          } else if (match[1] === 'ipv6') {
            ipv6 = match[2].trim();
          }
        }
        await Setting.updateOrCreate({
          key: 'ip'
        }, {
          value: ipv4
        })
        await Setting.updateOrCreate({
          key: 'ipv6'
        }, {
          value: ipv6
        })
      })
      const singboxService = new SingBoxService()
      await singboxService.downloadCore()
      await singboxService.start()
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}