import Setting from '#models/setting'
import CoreService from '#services/core_service'
import TemplateService from '#services/template_service'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import fs from 'fs'
import path from 'path'
import app from '@adonisjs/core/services/app'
@inject()
export default class TemplatesController {
    constructor(private coreService: CoreService) {}
    async getTemplates() {
        return await TemplateService.getTemplates()
    }

    async createTemplate(ctx: HttpContext) {
        const { data } = ctx.request.body()
        const template = JSON.parse(data)
        if (!template.server || !template.client) {
            throw new Error('Invalid template')
        }

        const templateName = `custom-${Date.now()}`
        if (!fs.existsSync(app.makePath('tmp/templates'))) {
            fs.mkdirSync(app.makePath('tmp/templates'), { recursive: true })
        }
        fs.writeFileSync(path.join(app.makePath('tmp/templates'), `${templateName}.json`), data)
        ctx.request.updateBody({ type: templateName })
        return await this.initTemplate(ctx)
    }

    async initTemplate({ request }: HttpContext) {
        try {
            if (await Setting.findBy('key', 'server')) {
                return {
                    success: true,
                }
            }
            await new TemplateService(request.input('type')).init()
            await this.coreService.refresh()
            await this.coreService.start()
            return {
                success: true
            }
        } catch (e) {
            console.log(e)
            await Setting.truncate()
            throw e
        }
    }
}