// Parallel SFTP upload script
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const DEST_BASE = '/usr/home/blazrrbwuf/public_html/wholesale.blazr.africa'
const SRC_DIR = '/home/node/.openclaw/workspace/blazr-app/.next'
const CREDENTIALS = 'blazrrbwuf:19opIUfmMbq6RaR23iEY'
const HOST = 'blazr.africa'
const PORT = 2222

function getFiles(dir) {
  const files = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...getFiles(full))
      } else {
        const rel = full.slice(SRC_DIR.length + 1)
        files.push({ rel, full })
      }
    }
  } catch (e) {}
  return files
}

const files = getFiles(SRC_DIR)
console.log(`Uploading ${files.length} files...`)

function uploadFile(rel, full) {
  const dest = `sftp://${HOST}:${PORT}${DEST_BASE}/${rel}`
  try {
    execSync(
      `curl -s --insecure -u '${CREDENTIALS}' -T '${full}' '${dest}' 2>&1`,
      { timeout: 30000 }
    )
    return true
  } catch (e) {
    return false
  }
}

let done = 0
let errors = 0

// Upload in batches of 10
const batchSize = 10
for (let i = 0; i < files.length; i += batchSize) {
  const batch = files.slice(i, i + batchSize)
  const results = batch.map(f => {
    const ok = uploadFile(f.rel, f.full)
    return ok ? 1 : 0
  })
  done += results.filter(x => x).length
  errors += results.filter(x => !x).length
  process.stdout.write(`\r${done}/${files.length} uploaded, ${errors} errors`)
}

console.log(`\n✅ Done: ${done} uploaded, ${errors} errors`)
