

import SingBoxService from '#services/singbox_service'
import axios from 'axios'
import Setting from '#models/setting'
import app from '@adonisjs/core/services/app'
import https from 'https'

if (app.getEnvironment() === 'web') {
  axios.get('https://cloudflare.com/cdn-cgi/trace', { httpsAgent: new https.Agent({ family: 4 })})
  .then(async res => {
    let ipv4 = '';
    const regex = /^(ip)=(.+)$/gm;
    let match;
    while ((match = regex.exec(res.data)) !== null) {
      if (match[1] === 'ip') {
        ipv4 = match[2].trim();
      }
    }
    await Setting.updateOrCreate({
      key: 'ip'
    }, {
      value: ipv4
    })
  })
  axios.get('https://cloudflare.com/cdn-cgi/trace', { httpsAgent: new https.Agent({ family: 6 })})
  .then(async res => {
    let ipv6 = '';
    const regex = /^(ip)=(.+)$/gm;
    let match;
    while ((match = regex.exec(res.data)) !== null) {
      if (match[1] === 'ip') {
        ipv6 = match[2].trim();
      }
    }
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