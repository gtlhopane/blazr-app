// SFTP upload script
// Uploads the Next.js static export to the production server
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const DEST_DIR = '/usr/home/blazrrbwuf/public_html/wholesale.blazr.africa'
const SRC_DIR = '/home/node/.openclaw/workspace/blazr-app/.next'

function run(cmd) {
  console.log('>', cmd.slice(0, 80))
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' })
}

function getFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getFiles(full))
    } else {
      files.push(full.slice(SRC_DIR.length + 1))
    }
  }
  return files
}

const files = getFiles(SRC_DIR)
console.log(`Found ${files.length} files to upload`)

// Create remote directories
const dirs = [...new Set(files.map(f => path.dirname(f)))].filter(d => d !== '')
for (const dir of dirs) {
  try {
    run(`curl -s --insecure -u 'blazrrbwuf:19opIUfmMbq6RaR23iEY' 'sftp://blazr.africa:2222${DEST_DIR}/${dir}/' -X MKZD 2>&1`)
    process.stdout.write('.')
  } catch (e) {}
}
console.log('\nDirectories created')

// Upload files
let uploaded = 0
for (const file of files) {
  const src = path.join(SRC_DIR, file)
  const dest = `sftp://blazr.africa:2222${DEST_DIR}/${file}`
  try {
    run(`curl -s --insecure -u 'blazrrbwuf:19opIUfmMbq6RaR23iEY' -T '${src}' '${dest}' 2>&1`)
    uploaded++
    if (uploaded % 10 === 0) process.stdout.write(`\n${uploaded}/${files.length} `)
    else process.stdout.write('.')
  } catch (e) {
    console.error(`\nFailed: ${file}`)
  }
}

console.log(`\n✅ Uploaded ${uploaded}/${files.length} files`)
