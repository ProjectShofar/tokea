import app from '@adonisjs/core/services/app'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import WebSocket from 'ws'
import logger from '@adonisjs/core/services/logger'

function connectWebSocket(url: string, onMessage: (data: any) => void) {
  const ws = new WebSocket(url)
  ws.on('open', () => {
  })
  ws.on('message', (data) => {
    onMessage(data.toString())
  })
  ws.on('error', (error) => {
    logger.error(error.message)
  })
  ws.on('close', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    connectWebSocket(url, onMessage)
  })
  return ws
}

if (app.getEnvironment() === 'web') {
  app.ready(() => {
    const io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
    })
    io?.on('connection', (socket) => {
      socket.on('test', (data) => {
          console.log(data)
          socket.emit('test', 'test')
      })
    })
    connectWebSocket('ws://127.0.0.1:9098/connections?token=', (data) => {
      io.emit('connections', JSON.parse(data));
    })
    connectWebSocket('ws://127.0.0.1:9098/traffic?token=', (data) => {
      io.emit('traffic', JSON.parse(data));
    })
  })
}