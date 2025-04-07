// import type { HttpContext } from '@adonisjs/core/http'

import Setting from "#models/setting";

export default class ConfigsController {
    async getConfigs() {
        const inbounds = (await Setting.query().where('key', 'inbounds').first())?.value
        return {
            inbounds,
            inited: !!inbounds,
            ip: (await Setting.query().where('key', 'ip').first())?.value,
            ipv6: (await Setting.query().where('key', 'ipv6').first())?.value,
        }
    }
}