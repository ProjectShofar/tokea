import app from '@adonisjs/core/services/app'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import Setting from '#models/setting'
import path from 'path'
import zlib from 'zlib'
import tar from 'tar-stream'
import axios from 'axios'
import fs from 'fs'
import { spawn, spawnSync } from 'child_process'
import logger from '@adonisjs/core/services/logger'
import TemplateService from './template_service.js'


export default class SingBoxService {
    version: string = '1.11.5'
    configDir: string
    configPath: string
    binPath: string

    constructor() {
        this.configDir = app.makePath('tmp/singbox')
        if (!existsSync(this.configDir)) {
            mkdirSync(this.configDir, { recursive: true })
        }
        this.configPath = path.join(this.configDir, 'config.json')
        this.binPath = path.join(this.configDir, 'sing-box')
    }

    async refresh() {
        const inbounds = (await Setting.query().where('key', 'inbounds').first())?.value
        const template = await new TemplateService(inbounds?.[0]?.type || '').getInstance()
        const users = await template.getUsers()
        const config = {
            inbounds: inbounds?.map(inbound => {
                return {
                    ...inbound,
                    users
                }
            })
        }
        writeFileSync(this.configPath, JSON.stringify(config), { encoding: 'utf-8' })
        return this
    }

    async kill() {
        try {
            const pid = parseInt(fs.readFileSync(path.join(this.configDir, 'sing-box.pid'), 'utf-8'))
            if (pid) {
                process.kill(pid, 'SIGTERM')
                fs.unlinkSync(path.join(this.configDir, 'sing-box.pid'))
                return
            }
        } catch (e) {}
    }

    async start() {
        logger.info('start singbox')
        try {
            if (!existsSync(this.configPath)) {
                return;
            }
            await this.kill();
            const child = spawn(this.binPath, ['run', '-D', this.configDir])
            if (child.pid) {
                fs.writeFileSync(path.join(this.configDir, 'sing-box.pid'), child.pid.toString())
            }
            child.stdout.on('data', (data) => {
                logger.info(data.toString())
            });
            child.stderr.on('data', (data) => {
                logger.info(data.toString())
            });
            child.on('error', (error) => {
                throw error
            })
            child.on('close', (code) => {
                logger.info('child process exited', code)
                if (code !== 0) this.start()
            });
        } catch (e) {
            logger.error(e)
            throw e
        }
    }

    async downloadCore() {
        if (existsSync(this.binPath)) {
            const result = spawnSync(this.binPath, ['version'])
            const nowVersion = result?.stdout?.toString('utf-8')?.match(/version\s+(\d+\.\d+\.\d+)/i)?.[1]
            if (nowVersion === this.version) return
        }
        const response =  await axios.get('https://github.com/SagerNet/sing-box/releases/download/v1.11.5/sing-box-1.11.5-darwin-arm64.tar.gz', { responseType: 'arraybuffer' })
        const compressedBuffer = Buffer.from(response.data)
        const tarBuffer = zlib.gunzipSync(compressedBuffer)
        const extract = tar.extract()
        extract.on('entry', (header, stream, next) => {
            if (path.basename(header.name) === 'sing-box') {
                const writeStream = fs.createWriteStream(this.binPath);
                stream.pipe(writeStream);
                writeStream.on('finish', () => {
                    fs.chmodSync(this.binPath, 0o755);
                    next()
                });
            } else {
                stream.resume();
                next()
            }
        })
        extract.end(tarBuffer)
    }
}
