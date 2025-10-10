import fs from "fs";
import app from "@adonisjs/core/services/app";
import axios from "axios";
import https from "https";
import forge from "node-forge";
import path from "path";

export async function createCSR(CN: string) {
  const tmpDir = app.makePath('tmp')
  // 确保目录存在
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const keys = forge.pki.rsa.generateKeyPair(4096);

  // 创建 CSR
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;

  // 设置主题信息
  csr.setSubject([
    { name: 'commonName', value: CN },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'California' },
    { name: 'localityName', value: 'Los Angeles' },
    { name: 'organizationName', value: 'Tokea' },
    { name: 'organizationalUnitName', value: 'Tokea' }
  ]);

  // 签名 CSR
  csr.sign(keys.privateKey, forge.md.sha256.create());

  // 转换为 PEM 格式
  const csrPem = forge.pki.certificationRequestToPem(csr);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

  // 保存文件
  const privateKeyPath = path.join(tmpDir, 'private.key');
  const csrPath = path.join(tmpDir, 'request.csr');

  fs.writeFileSync(privateKeyPath, privateKeyPem);
  fs.writeFileSync(csrPath, csrPem);

  console.log('✓ CSR created');

  return csrPem
}

export async function getIPv4() {
  const res = await axios.get('https://cloudflare.com/cdn-cgi/trace', { httpsAgent: new https.Agent({ family: 4 })})
  const regex = /^(ip)=(.+)$/gm;
  let match;
  while ((match = regex.exec(res.data)) !== null) {
    if (match[1] === 'ip') {
      return match[2].trim()
    }
  }
  return null
}