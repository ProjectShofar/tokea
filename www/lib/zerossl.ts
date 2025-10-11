import axios from 'axios'
import { createCSR, getIPv4 } from '#lib/helper'
import http from 'http'
import fs from 'fs'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

export default class Zerossl {
    private key: string
    private ipv4: string
    constructor(key: string) {
        this.key = key
        this.ipv4 = ''
    }

    async checkCertificates() {
        try {
            const { data: certificates } = await axios.get(`https://api.zerossl.com/certificates?access_key=${this.key}`)
            for (const certificate of certificates?.results || []) {
                if (certificate.status === 'draft') {
                    const { data: { success } } = await axios.post(`https://api.zerossl.com/certificates/${certificate.id}/cancel?access_key=${this.key}`)
                    if (success) {
                        logger.info(`Certificate ${certificate.id} cancelled`)
                    }
                }
                if (certificate.status === 'issued' && certificate.common_name === this.ipv4) {
                    await this.getCertificate(certificate.id)
                    logger.info(`Certificate ${certificate.id} found and downloaded`)
                    return true
                }
            }
        } catch (e) {
            console.log(e.response.data)
        }
    }

    async validateCertificate(validateID: string, retires = 0): Promise<void> {
        console.log(`Validation ID: ${validateID}`)
        try {
            const { data: challengeData } = await axios.post(`https://api.zerossl.com/certificates/${validateID}/challenges?access_key=${this.key}`, {
                validation_method: 'HTTP_CSR_HASH'
            })
            console.log(challengeData)
        } catch (e) {
            if (retires < 3) {
                return await this.validateCertificate(validateID, retires + 1)
            }
            throw e.response.data
        }
    }

    async getCertificate(validateID: string): Promise<void> {
        while (true) {
            try {
                const { data: certificateData } = await axios.get(`https://api.zerossl.com/certificates/${validateID}?access_key=${this.key}`)
                if (certificateData?.status !== 'issued') {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    continue;
                }
                break;
            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                continue;
            }
        }
        const { data } = await axios.get(`https://api.zerossl.com/certificates/${validateID}/download/return?access_key=${this.key}&include_cross_signed=1`)
        if (!data?.['certificate.crt']) {
            throw new Error('Certificate download failed')
        }
        fs.writeFileSync(app.makePath('tmp/certificate.crt'), data['certificate.crt'])
    }

    async init() {
        await new Promise(async resolve => {
            const ipv4 = await getIPv4()
            if (!ipv4) {
                throw new Error('IPv4 not found')
            }
            this.ipv4 = ipv4
            if (await this.checkCertificates()) {
                resolve(true)
                return
            }
            const csr = await createCSR(ipv4)
            if (!csr) {
                throw new Error('CSR not found')
            }
            
            const { data } = await axios.post(`https://api.zerossl.com/certificates?access_key=${this.key}`, {
                certificate_domains: ipv4,
                certificate_csr: csr
            })
            
            const validateURL = data?.validation?.other_methods?.[ipv4]?.file_validation_url_http
            console.log(`Validate URL: ${validateURL}`)
            if (!validateURL) {
                throw new Error('Validation url not found')
            }
            const validatePath = new URL(validateURL).pathname
            const validateContent = data?.validation?.other_methods?.[ipv4]?.file_validation_content?.join('\n')
            const validateID = data?.id
            
            const server = http.createServer((req, res) => {
                console.log(`Request URL: ${req?.url}`)
                if (req?.url === validatePath) {
                    res.end(validateContent)
                }
            })
            
            server.listen(80, async () => {
                console.log('Validation server is running on port 80')
                await this.validateCertificate(validateID)
                await this.getCertificate(validateID)
                server.close()
                resolve(true)
            })
        })
    }
    
}