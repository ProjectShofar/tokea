import type { HttpContext } from '@adonisjs/core/http'
import ZeroSSL from '#lib/zerossl'
import Setting from '#models/setting'

export default class ZerosslsController {
    async init(ctx: HttpContext) {
        const { key } = ctx.request.body()
        await new ZeroSSL(key).init()
        await Setting.updateOrCreate({ key: 'zerossl_key' }, { value: key })
        setTimeout(() => {
            process.exit(0)
        }, 1000)
        return {
            success: true
        }
    }
}