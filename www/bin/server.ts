/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'
import fs from 'fs'
import path from 'path'
import https from 'https'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
      if (process.env.ZEROSSL_API_KEY) {
        await import('#start/zerossl')
      }
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })

const certPath = path.join(new URL('.', APP_ROOT).pathname, 'tmp', 'certificate.crt')
const keyPath = path.join(new URL('.', APP_ROOT).pathname, 'tmp', 'private.key')
const useHttps = process.env.ZEROSSL_API_KEY && fs.existsSync(certPath) && fs.existsSync(keyPath)

if (process.env.ZEROSSL_API_KEY && !useHttps) {
  throw new Error('SSL certificate application failed. If you want to run it under http, please remove ZEROSSL_API_KEY. Please note: running it under http will cause security issues and your content may be stolen by a man-in-the-middle.')
}

if (useHttps) {
  console.log('Using HTTPS with ZeroSSL certificate')
  ignitor
    .httpServer()
    .start((handler) => {
      return https.createServer(
        {
          cert: fs.readFileSync(certPath, 'utf-8'),
          key: fs.readFileSync(keyPath, 'utf-8'),
        },
        handler
      )
    })
    .catch((error: any) => {
      process.exitCode = 1
      prettyPrintError(error)
    })
} else {
  ignitor
    .httpServer()
    .start()
    .catch((error: any) => {
      process.exitCode = 1
      prettyPrintError(error)
    })
}
