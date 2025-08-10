import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { randomUUID } from 'crypto'
import CoreService from '#services/core_service'
import Setting from '#models/setting'
import TemplateService from '#services/template_service'
import { inject } from '@adonisjs/core/container'
@inject()
export default class UsersController {
    constructor(private coreService: CoreService) {}
    async addUsers({ request }: HttpContext) {
        const payload = await request.validateUsing(vine.compile(vine.object({
            username: vine.string().trim().unique(async (db, value, field) => {
                return !(await User.query().where('username', value).first())
            })
        })))
        const user = await User.create({
            username: payload.username,
            uuid: randomUUID()
        })
        await this.coreService.refresh()
        await this.coreService.start()
        return user
    }

    async getUsers() {
        return User.all()
    }

    async deleteUser({ params }: HttpContext) {
        const user = await User.findOrFail(params.id)
        await user.delete()
        await this.coreService.refresh()
        await this.coreService.start()
        return user
    }

    async getSubscription({ params }: HttpContext) {
        const user = await User.query().where('uuid', params.uuid).firstOrFail()
        const inbound = (await Setting.query().where('key', 'inbounds').first())?.value?.[0]
        const template = await new TemplateService(inbound?.type).getInstance()
        return await template.config(user.uuid)
    }
}