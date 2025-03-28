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
import UsersController from '#controllers/users_controller'

router.get ('/', async () => {
  return {
    hello: 'world',
  }
})

router.get ('/templates', [TemplatesController, 'getTemplates'])
router.post('/templates/:type', [TemplatesController, 'initTemplate'])

router.get ('/configs', [ConfigsController, 'getConfigs'])

router.post('/users', [UsersController, 'addUsers'])
router.get ('/users', [UsersController, 'getUsers'])
router.delete('/users/:id', [UsersController, 'deleteUser'])
