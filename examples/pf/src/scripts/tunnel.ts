import { build, preview } from 'astro'
import { startTunnel } from 'untun'

const tunnel = await startTunnel({
  port: 4322,
})
if (!tunnel) {
  throw new Error('Failed to start tunnel')
}

let url = new URL(await tunnel.getURL())
console.log(`Tunnel started at ${url.href}, building site...`)

await build({
  logLevel: 'error',
  site: url.origin,
})
console.log('Site built, starting preview server...')

const server = await preview({
  logLevel: 'error',
  server: { allowedHosts: [url.hostname], port: 4322 },
})
console.log('Preview server started, presenting tunnel URL...')

url = new URL(await tunnel.getURL())
console.log(url.href)

// Keep the server running till interrupted.
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...')
  setTimeout(() => {
    void server.stop()
    process.exit(0)
  }, 1000)
})
