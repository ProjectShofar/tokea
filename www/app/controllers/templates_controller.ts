// import type { HttpContext } from '@adonisjs/core/http'

import app from "@adonisjs/core/services/app"
import { readdirSync } from "fs"
import path from "path"

export default class TemplatesController {
    async getTemplates() {
        return await this.loadTemplates()
    }

    async loadTemplates() {
        const targetDir = app.makePath('app/templates')
        const files = readdirSync(targetDir).filter(file => file.endsWith('.js'))
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