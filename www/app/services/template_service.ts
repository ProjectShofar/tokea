import app from '@adonisjs/core/services/app'
import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import Setting from '#models/setting'
import axios from 'axios'
import https from 'https'
import { Template } from '../../types.js'
import { randomUUID } from 'crypto'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import fs from 'fs'
import { HttpContext } from '@adonisjs/core/http'
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
      await this.getIPv4()
      await this.getIPv6()
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

    async getIPv4() {
      try {
        const res = await axios.get('https://cloudflare.com/cdn-cgi/trace', { httpsAgent: new https.Agent({ family: 4 })})
        const regex = /^(ip)=(.+)$/gm;
        let match;
        while ((match = regex.exec(res.data)) !== null) {
          if (match[1] === 'ip') {
            await Setting.updateOrCreate({
              key: 'ip'
            }, {
              value: match[2].trim()
            })
          }
        }
      } catch (e) {
        logger.error(e.message)
      }
    }


    async getIPv6() {
      try {
        const res = await axios.get('https://cloudflare.com/cdn-cgi/trace', { httpsAgent: new https.Agent({ family: 6 })})
        const regex = /^(ip)=(.+)$/gm;
        let match;
        while ((match = regex.exec(res.data)) !== null) {
          if (match[1] === 'ip') {
            await Setting.updateOrCreate({
              key: 'ipv6'
            }, {
              value: match[2].trim()
            })
          }
        }
      } catch (e) {
        logger.error(e.message)
      }
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

    async buildSubscribe(user: User) {
      const ctx = HttpContext.getOrFail()
      const files = fs.readdirSync(app.makePath('app/subscribes'), { withFileTypes: true }).filter(file => file.isFile())
      for (const file of files) {
        if (!(file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
          continue
        }
        const subscribe = await import(app.makePath(`app/subscribes/${file.name}`))
        if (subscribe.default) {
          const instance = new subscribe.default(this.template, user)
          if (!ctx.request.header('User-Agent')?.toString().includes(instance.ua)) {
            continue
          }
          return await instance.handle()
        }
      }
    }
}
