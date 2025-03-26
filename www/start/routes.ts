/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import ConfigsController from '#controllers/configs_controller'
import TemplatesController from '#controllers/templates_controller'
import router from '@adonisjs/core/services/router'

router.get ('/', async () => {
  return {
    hello: 'world',
  }
})

router.get ('/templates', [TemplatesController, 'getTemplates'])
router.post('/templates/:type', [TemplatesController, 'initTemplate'])

router.get ('/configs', [ConfigsController, 'getConfigs'])