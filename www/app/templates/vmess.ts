import { Template } from '../../types.js'

export default class Vmess implements Template {
    type: string
    name: string
    description: string

    constructor() {
        this.type = 'vmess'
        this.name = 'Vmess'
        this.description = '始于2015年，由V2Ray开发的协议，有较强的伪装能力。'
    }

    init() {

    }
}
