import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { randomUUID } from 'crypto'
import SingBoxService from '#services/singbox_service'

export default class UsersController {
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
        const singboxService = new SingBoxService()
        await singboxService.refresh()
        await singboxService.start()
        return user
    }

    async getUsers() {
        return User.all()
    }

    async deleteUser({ params }: HttpContext) {
        const user = await User.findOrFail(params.id)
        await user.delete()
        const singboxService = new SingBoxService()
        await singboxService.refresh()
        await singboxService.start()
        return user
    }
}