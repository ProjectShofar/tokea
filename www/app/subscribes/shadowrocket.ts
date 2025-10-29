import { Subscribe, Template } from "../../types.js"
import User from "#models/user"


export default class Shdowrocket implements Subscribe {
  public ua: string = 'shadowrocket'
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
    let data = ''
    data+=this[this.template.client.type]() + '\r\n'
    return Buffer.from(data).toString('base64url')
  }

  shadowsocks() {
    return `ss://${Buffer.from(`${this.template.client.cipher}:${this.user.uuid}@${this.template.client.server}:${this.template.client.server_port}`).toString('base64url')}#${this.template.client.server}`
  }

  vmess() {
    const host = this.template.client.transport ? (this.template.client.transport.host?.length ? this.template.client.transport.host[0] : this.template.client.transport.host) : ''
    const path = this.template.client.transport ? this.template.client.transport.path : ''
    const type = this.template.client.transport ? this.template.client.transport.type : ''
    const tls = this.template.client.tls ? (this.template.client.tls.enabled ? 1 : 0) : 0
    const alterId = this.template.client.alter_id ? this.template.client.alter_id : 0
    return `vmess://${Buffer.from(`auto:${this.user.uuid}@${this.template.client.server}:${this.template.client.server_port}`).toString('base64url')}?remarks=${this.template.client.server}&obfsParam=${host}&path=${path}&obfs=${type}&tls=${tls}&alterId=${alterId}`
  }
}