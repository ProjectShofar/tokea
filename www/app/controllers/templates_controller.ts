import Setting from '#models/setting'
import SingBoxService from '#services/singbox_service'
import TemplateService from '#services/template_service'
import type { HttpContext } from '@adonisjs/core/http'

import db from '@adonisjs/lucid/services/db'
export default class TemplatesController {
    async getTemplates() {
        return await TemplateService.getTemplates()
    }

    async initTemplate({ request }: HttpContext) {
        const instance = await new TemplateService(request.param('type')).getInstance()
        const transaction = await db.transaction()
        try {
            if (await Setting.query({ client: transaction }).forUpdate().where('key', 'inbounds').first()) {
                throw new Error('Template already initialized')
            }
            instance.init()
            await transaction.commit()
            const singboxService = new SingBoxService()
            await singboxService.refresh()
            await singboxService.start()
            return {
                success: true
            }
        } catch (e) {
            await transaction.rollback()
            throw e
        }
    }
}