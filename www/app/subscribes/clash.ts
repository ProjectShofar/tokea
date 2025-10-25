import { Subscribe, Template } from "../../types.js"
import User from "#models/user"
import app from "@adonisjs/core/services/app"
import yaml from 'js-yaml'
import { readFileSync } from 'fs'


export default class Clash implements Subscribe {
  public ua: string = 'clash'
  private template: Template
  private user: User

  constructor(template: Template, user: User) {
      this.template = template
      this.user = user
  }

  handle(): any {
    if (!this[this.template.client.type]) {
      throw new Error('Invalid client type')
    }
    const defaultConfig = yaml.load(readFileSync(app.makePath('resources/clash.yaml'), { encoding: 'utf-8' })) as any
    defaultConfig.proxies = []
    defaultConfig.proxies.push(this[this.template.client.type]())
    defaultConfig['proxy-groups'] = defaultConfig.proxies.map((proxy: any) => ({
      name: '节点选择',
      type: 'select',
      proxies: [proxy.name]
    }))
    return yaml.dump(defaultConfig)
  }

  shadowsocks() {
    return {
      name: this.template.client.server,
      type: 'ss',
      server: this.template.client.server,
      port: this.template.client.server_port,
      cipher: this.template.client.method,
      password: this.user.uuid,
      ...(this.template.client?.plugin === 'obfs-local' ? { plugin: 'obfs' } : {}),
      ...(this.template.client?.plugin === 'v2ray-plugin' ? { plugin: 'v2ray-plugin' } : {}),
      ...(this.template.client?.plugin_opts ? (() => {
        const opts = this.template.client?.plugin_opts?.split(';')?.map((opt: string) => opt.split('=')) as [string, string][] ?? []
        const map = {
          obfs: 'mode',
          'obfs-host': 'host'
        }
        return {
          'plugin-opts': opts.reduce((acc: Record<string, string>, [key, value]: [string, string]) => {
            acc[map[key as keyof typeof map]] = value
            return acc
          }, {})
        }
      })() : {})
    }
  }

  vmess() {
    return {
      name: this.template.client.server,
      type: 'vmess',
      server: this.template.client.server,
      port: this.template.client.server_port,
      uuid: this.user.uuid,
      alterId: 0,
      cipher: 'auto',
      tls: this.template.client.tls?.enabled ?? false,
      servername: this.template.client.tls?.server_name,
      'skip-cert-verify': this.template.client.tls?.insecure ?? false
    }
  }
}