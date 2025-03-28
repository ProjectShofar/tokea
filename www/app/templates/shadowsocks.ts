import { randomUUID } from 'crypto'
import { Template } from '../../types.js'
import Settings from '../models/setting.js'
import User from '#models/user'

export default class Shadowsocks implements Template {
    type: string
    name: string
    description: string

    constructor() {
        this.type = 'shadowsocks'
        this.name = 'Shadowsocks'
        this.description = '始于2013年，最常见的翻墙协议，兼顾性能与安全性。'
    }

    init() {
        Settings.create({
            key: 'inbounds',
            value: [{
                type: 'shadowsocks',
                listen: '::',
                method: 'aes-256-gcm',
                listen_port: Math.floor(Math.random() * (65535 - 1024 + 1) + 1024),
                password: randomUUID()
            }]
        })
    }

    async getUsers() {
        const users = await User.all()
        return users.map(user => ({
            name: user.username,
            password: user.uuid
        }))
    }
}
