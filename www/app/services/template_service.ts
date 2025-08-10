import app from '@adonisjs/core/services/app'
import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import Setting from '#models/setting'
import axios from 'axios'
import https from 'https'
import { Template } from '../../types.js'
import { randomUUID } from 'crypto'
import User from '#models/user'
export default class TemplateService {
    templateName: string
    template: Template
    isCustom: boolean
    constructor(templateName: string) {
        this.templateName = templateName
        this.isCustom = templateName.startsWith('custom-')
        this.template = this.getTemplate()
    }

    async init() {
      await this.getIP()
      await Setting.updateOrCreate({
        key: 'server'
      }, {
        value: {
          ...this.template.server,
          listen: '::',
          listen_port: Math.floor(Math.random() * (65535 - 1024 + 1) + 1024),
          ...(this.template.server?.password ? { password: randomUUID() } : {})
        }
      })
      await Setting.updateOrCreate({
          key: 'inited'
      }, {
          value: 1
      })
      await Setting.updateOrCreate({
          key: 'template'
      }, {
          value: this.templateName
      })
      return this
    }

    async getIP() {
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
    }

    getTemplate() {
        const targetDir = this.isCustom ? app.makePath('tmp/templates') : app.makePath('app/templates')
        const filePath = path.join(targetDir, `${this.templateName}.json`)
        if (!existsSync(filePath)) {
            throw new Error('Template not found')
        }
        const template = JSON.parse(readFileSync(filePath, 'utf-8'))
        if (!template.server || !template.client) {
          throw new Error('Invalid template')
        }
        return {
          name: template._name,
          description: template._description,
          server: template.server,
          client: template.client
        }
    }

    static async getTemplates() {
        const targetDir = app.makePath('app/templates')
        const files = readdirSync(targetDir).filter(file => file.endsWith('.json'))
        const templates = []
        for (const file of files) {
            const filePath = path.join(targetDir, file)
            const template = JSON.parse(readFileSync(filePath, 'utf-8'))
            templates.push({
              type: file.replace('.json', ''),
              name: template._name,
              description: template._description,
            })
        }
        return templates
    }

    async buildUsers() {
      const users = await User.all()
      switch (this.template?.server.type) {
        case 'shadowsocks':
          return users.map(user => ({
            name: user.username,
            password: user.uuid
          }))
        case 'vmess':
          return users.map(user => ({
            name: user.username,
            uuid: user.uuid
          }))
      }
    }
}
