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
import os from 'os'


export default class CoreService {
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
        const server = (await Setting.query().where('key', 'server').first())?.value
        const template = (await Setting.query().where('key', 'template').first())?.value
        const users = await new TemplateService(template).buildUsers()
        const config = {
            inbounds: [
                {
                    ...server,
                    users,
                }
            ],
            experimental: {
                clash_api: {
                    external_controller: '127.0.0.1:9098',
                }
            }
        }
        writeFileSync(this.configPath, JSON.stringify(config), { encoding: 'utf-8' })
        return this
    }

    async isRunning() {
        try {
            const pid = parseInt(fs.readFileSync(path.join(this.configDir, 'sing-box.pid'), 'utf-8'))
            process.kill(pid, 0)
            return true
        } catch (e) {
            if (e.code === 'ESRCH') {
                return false
            }
        }
    }

    async kill() {
        try {
            const pid = parseInt(fs.readFileSync(path.join(this.configDir, 'sing-box.pid'), 'utf-8'))
            if (pid) {
                process.kill(pid, 'SIGTERM')
                fs.unlinkSync(path.join(this.configDir, 'sing-box.pid'))
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
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
            await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (e) {
            logger.error(e)
            throw e
        }
    }

    async downloadCore() {
        logger.info(`downloadCore ${this.version} ${os.platform()} ${os.arch()}`)
        if (existsSync(this.binPath)) {
            const result = spawnSync(this.binPath, ['version'])
            const nowVersion = result?.stdout?.toString('utf-8')?.match(/version\s+(\d+\.\d+\.\d+)/i)?.[1]
            if (nowVersion === this.version) return
        }
        const archMap: Record<string, string> = {
            'x64': 'amd64',
        }
        const arch = archMap[os.arch()] || os.arch()
        const response =  await axios.get(`https://github.com/SagerNet/sing-box/releases/download/v1.11.5/sing-box-1.11.5-${os.platform()}-${arch}.tar.gz`, { responseType: 'arraybuffer' })
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
        logger.info(`downloadCore ${this.version} ${os.platform()} ${os.arch()} success`)
        return this
    }
}
