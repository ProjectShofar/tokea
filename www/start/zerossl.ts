import axios from 'axios'
import { createCSR, getIPv4 } from '#lib/helper'
import http from 'http'
import fs from 'fs'
import app from '@adonisjs/core/services/app'

const cancelCertificates = async () => {
    try {
        const { data: certificates } = await axios.get(`https://api.zerossl.com/certificates?access_key=${process.env.ZEROSSL_API_KEY}`)
        for (const certificate of certificates?.results || []) {
            if (certificate.status === 'draft') {
                const { data: { success } } = await axios.post(`https://api.zerossl.com/certificates/${certificate.id}/cancel?access_key=${process.env.ZEROSSL_API_KEY}`)
                if (success) {
                    console.log(`Certificate ${certificate.id} cancelled`)
                }
            }
        }
    } catch (e) {
        console.log(e.response.data)
    }
}

const validateCertificate = async (validateID: string, retires = 0) => {
    console.log(`Validation ID: ${validateID}`)
    try {
        const { data: challengeData } = await axios.post(`https://api.zerossl.com/certificates/${validateID}/challenges?access_key=${process.env.ZEROSSL_API_KEY}`, {
            validation_method: 'HTTP_CSR_HASH'
        })
        console.log(challengeData)
    } catch (e) {
        if (retires < 3) {
            return await validateCertificate(validateID, retires + 1)
        }
        throw e.response.data
    }
}

const getCertificate = async (validateID: string) => {
    while (true) {
        try {
            const { data: certificateData } = await axios.get(`https://api.zerossl.com/certificates/${validateID}?access_key=${process.env.ZEROSSL_API_KEY}`)
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
    const { data } = await axios.get(`https://api.zerossl.com/certificates/${validateID}/download/return?access_key=${process.env.ZEROSSL_API_KEY}&include_cross_signed=1`)
    if (!data?.['certificate.crt']) {
        throw new Error('Certificate download failed')
    }
    fs.writeFileSync(app.makePath('tmp/certificate.crt'), data['certificate.crt'])
}

await new Promise(async resolve => {
    await cancelCertificates()
    const ipv4 = await getIPv4()
    if (!ipv4) {
        throw new Error('IPv4 not found')
    }
    const csr = await createCSR(ipv4)
    if (!csr) {
        throw new Error('CSR not found')
    }
    
    const { data } = await axios.post(`https://api.zerossl.com/certificates?access_key=${process.env.ZEROSSL_API_KEY}`, {
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
        await validateCertificate(validateID)
        await getCertificate(validateID)
        resolve(true)
    })
})
