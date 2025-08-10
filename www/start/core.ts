

import CoreService from '#services/core_service'
import app from '@adonisjs/core/services/app'

if (app.getEnvironment() === 'web') {
  app.container.singleton(CoreService, () => {
    return new CoreService()
  })
  const coreService = await app.container.make(CoreService)
  await coreService.downloadCore()
  await coreService.start()
}