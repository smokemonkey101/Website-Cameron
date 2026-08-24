const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const port = Number(process.env.PORT) || 3000
const host = '0.0.0.0'
const distDirectory = path.join(__dirname, 'dist')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname)
  const safePath = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, '')
  let filePath = path.join(distDirectory, safePath)

  if (!filePath.startsWith(distDirectory)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isDirectory()) filePath = path.join(filePath, 'index.html')

    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        fs.readFile(path.join(distDirectory, 'index.html'), (indexError, indexContent) => {
          if (indexError) {
            response.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'})
            response.end('The site has not been built. Run npm run build first.')
            return
          }

          response.writeHead(200, {'Content-Type': contentTypes['.html']})
          response.end(indexContent)
        })
        return
      }

      const extension = path.extname(filePath).toLowerCase()
      response.writeHead(200, {'Content-Type': contentTypes[extension] || 'application/octet-stream'})
      response.end(content)
    })
  })
})

server.listen(port, host, () => {
  console.log(`Website Cameron is running on ${host}:${port}`)
})
