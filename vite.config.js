import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'serve-local-docs',
      configureServer(server) {
        server.middlewares.use('/docs', (req, res, next) => {
          // 安全过滤：禁止 .. 路径遍历
          const safeUrl = decodeURIComponent(req.url || '').replace(/\.\./g, '').replace(/^\//, '')
          if (!safeUrl) {
            res.statusCode = 403
            res.end('Forbidden')
            return
          }
          const filePath = path.join(process.cwd(), '文档', safeUrl)
          // 确保路径仍在文档目录内
          const docsDir = path.resolve(process.cwd(), '文档')
          const resolvedPath = path.resolve(filePath)
          if (!resolvedPath.startsWith(docsDir)) {
            res.statusCode = 403
            res.end('Forbidden')
            return
          }
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          const stat = fs.statSync(filePath)
          if (stat.isDirectory()) {
            res.statusCode = 403
            res.end('Forbidden')
            return
          }
          const ext = path.extname(filePath).toLowerCase()
          const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
          // 设置 Content-Disposition 让浏览器可以预览或下载
          const filename = path.basename(filePath)
          res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(filename)}`)
          fs.createReadStream(filePath).pipe(res)
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: false
  }
})
