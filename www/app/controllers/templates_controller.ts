import Setting from '#models/setting'
import SingBoxService from '#services/singbox_service'
import type { HttpContext } from '@adonisjs/core/http'

import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { existsSync, readdirSync } from "fs"
import path from "path"

export default class TemplatesController {
    async getTemplates() {
        return await this.loadTemplates()
    }

    async loadTemplates() {
        const targetDir = app.makePath('app/templates')
        const files = readdirSync(targetDir).filter(file => file.endsWith('.ts'))
        const templates = []
        for (const file of files) {
            const filePath = path.join(targetDir, file)
            const module = await import(filePath)
            const instance = new module.default()
            templates.push(instance)
        }
        return templates
    }

    async initTemplate({ request }: HttpContext) {
        const targetDir = app.makePath('app/templates')
        const filePath = path.join(targetDir, request.param('type') + '.ts')
        if (!existsSync(filePath)) {
            throw new Error('Template not found')
        }
        const module = await import(filePath)
        const instance = new module.default()
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