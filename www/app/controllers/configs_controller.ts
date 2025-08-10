// import type { HttpContext } from '@adonisjs/core/http'

import Setting from "#models/setting";
import User from "#models/user";
import CoreService from "#services/core_service";
import { inject } from '@adonisjs/core/container'
import { HttpContext } from "@adonisjs/core/http";
@inject()
export default class ConfigsController {
    constructor(private coreService: CoreService) {}
    async getConfigs() {
        const server = (await Setting.query().where('key', 'server').first())?.value
        return {
            server,
            title: (await Setting.query().where('key', 'title').first())?.value || 'Tokea',
            inited: !!server,
            running: await this.coreService.isRunning(),
            ip: (await Setting.query().where('key', 'ip').first())?.value,
            ipv6: (await Setting.query().where('key', 'ipv6').first())?.value,
        }
    }

    async reload() {
        await this.coreService.refresh()
        await this.coreService.start()
        return {
            success: true
        }
    }

    async reset() {
        await Setting.truncate()
        await User.truncate()
        await this.coreService.kill()
        return {
            success: true
        }
    }

    async setTitle(ctx: HttpContext) {
        const { title } = ctx.request.body()
        await Setting.updateOrCreate({ key: 'title' }, { value: title })
        return {
            success: true
        }
    }
}