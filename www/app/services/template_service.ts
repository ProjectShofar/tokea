import app from '@adonisjs/core/services/app'
import { existsSync, readdirSync } from 'fs'
import path from 'path'

export default class TemplateService {
    protocol: string
    constructor(type: string) {
        this.protocol = type
    }

    async getInstance() {
        const targetDir = app.makePath('app/templates')
        const filePath = path.join(targetDir, this.protocol + '.ts')
        if (!existsSync(filePath)) {
            throw new Error('Template not found')
        }
        const module = await import(filePath)
        return new module.default()
    }

    static async getTemplates() {
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
}
