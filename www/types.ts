
export interface Template {
    name: string
    description: string
    server: any
    client: Client
}

export interface Subscribe {
    ua: string
    handle(): any
}

export interface Client {
    type: 'shadowsocks' | 'vmess'
    server: string
    server_port: number
    method: string
    plugin: string
    plugin_opts: string
    tls: {
        enabled: boolean
        server_name: string
        insecure: boolean
    }
    password: string
    uuid: string
    alterId: number
    cipher: string
}