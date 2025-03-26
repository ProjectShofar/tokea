// import type { HttpContext } from '@adonisjs/core/http'

import Setting from "#models/setting";

export default class ConfigsController {
    async getConfigs() {
        const inbounds = await Setting.query().where('key', 'inbounds').first()
        return {
            inbounds,
            inited: !!inbounds
        }
    }
}