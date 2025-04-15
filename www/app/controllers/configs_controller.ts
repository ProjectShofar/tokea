// import type { HttpContext } from '@adonisjs/core/http'

import Setting from "#models/setting";
import SingBoxService from "#services/singbox_service";
export default class ConfigsController {
    async getConfigs() {
        const inbounds = (await Setting.query().where('key', 'inbounds').first())?.value
        const singboxService = new SingBoxService()
        return {
            inbounds,
            inited: !!inbounds,
            running: await singboxService.isRunning(),
            ip: (await Setting.query().where('key', 'ip').first())?.value,
            ipv6: (await Setting.query().where('key', 'ipv6').first())?.value,
        }
    }

    async reload() {
        const singboxService = new SingBoxService()
        await singboxService.refresh()
        await singboxService.start()
        return {
            success: true
        }
    }
}