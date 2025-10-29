
export interface Template {
    name: string
    description: string
    server: Server
    client: Client
}

export interface Subscribe {
    ua: string
    handle(): any
    shadowsocks(): any
    vmess(): any
}

export interface Server {
    type: 'shadowsocks' | 'vmess'
    listen: string
    listen_port: number
    password: string
    tls: {
        enabled: boolean
        server_name: string
        insecure: boolean
    }
    users: {
        name: string
        password: string
    }[] | {
        name: string
        uuid: string
    }
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
    alter_id: number
    cipher: string
    transport: {
        type: 'http' | 'ws' | 'quic' | 'grpc' | 'httpupgrade'
        host: string[] | string
        path: string
        headers: Record<string, string>
        service_name: string
    }
}