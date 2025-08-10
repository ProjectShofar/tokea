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
import { middleware } from './kernel.js'


router.group(() => {

  router.on('/').render('index')
  router.get ('/templates', [TemplatesController, 'getTemplates'])
  router.post('/templates/init', [TemplatesController, 'initTemplate'])
  router.post('/templates/create', [TemplatesController, 'createTemplate'])
  router.get ('/configs', [ConfigsController, 'getConfigs'])
  router.post('/configs/reload', [ConfigsController, 'reload'])
  router.post('/configs/reset', [ConfigsController, 'reset'])
  router.post('/configs/title', [ConfigsController, 'setTitle'])
  router.post('/users', [UsersController, 'addUsers'])
  router.get ('/users', [UsersController, 'getUsers'])
  router.delete('/users/:id', [UsersController, 'deleteUser'])

  // router.get ('/subscription/:uuid', [UsersController, 'getSubscription'])
}).use([
  middleware.auth()
])