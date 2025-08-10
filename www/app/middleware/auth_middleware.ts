import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Setting from '#models/setting'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */

    /**
     * Call next method in the pipeline and return its output
     */
    if (await Setting.findBy('key', 'username')) {
      const authorization = ctx.request.header('Authorization')
      if (!authorization) {
        return ctx.response.header('WWW-Authenticate', 'Basic realm="Protected"').unauthorized({ message: 'Unauthorized' })
      }
      const [username, password] = Buffer.from(authorization?.split(' ')?.[1], 'base64').toString().split(':')
      if ((username !== (await Setting.findBy('key', 'username'))?.value) || (password !== (await Setting.findBy('key', 'password'))?.value)) {
        return ctx.response.header('WWW-Authenticate', 'Basic realm="Protected"').unauthorized({ message: 'Unauthorized' })
      }
    }
    const output = await next()
    return output
  }
}