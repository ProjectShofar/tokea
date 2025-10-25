import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { randomUUID } from 'crypto'
import CoreService from '#services/core_service'
// import Setting from '#models/setting'
// import TemplateService from '#services/template_service'
import { inject } from '@adonisjs/core/container'
import TemplateService from '#services/template_service'
import Setting from '#models/setting'
@inject()
export default class UsersController {
    constructor(private coreService: CoreService) {}
    async addUsers({ request }: HttpContext) {
        const payload = await request.validateUsing(vine.compile(vine.object({
            username: vine.string().trim().unique(async (_, value) => {
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

    async getSubscribe(ctx: HttpContext) {
        const user = await User.query().where('uuid', ctx.params.uuid).firstOrFail()
        if (!user) {
            return ctx.response.status(404)
        }
        const template = new TemplateService((await Setting.query().where('key', 'template').first())?.value)
        return await template.buildSubscribe(user)
    }
}