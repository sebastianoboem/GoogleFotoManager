#!/usr/bin/env node
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { readVersion } = require('./rename-artifacts.cjs')

const version = process.argv[2] || readVersion()
const notesFile = process.argv[3]
const skipGithub = process.argv.includes('--skip-github')
const skipSourceforge = process.argv.includes('--skip-sourceforge')

if (!notesFile) {
  console.error(
    'Usage: node scripts/publish-release.cjs <version> <notes-file> [--skip-github] [--skip-sourceforge]'
  )
  process.exit(1)
}

function run(script, args) {
  console.log(`\n→ ${path.basename(script)} ${args.join(' ')}`)
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: 'inherit',
    env: process.env
  })
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!skipGithub) {
  run(path.join(__dirname, 'publish-github-release.cjs'), [version, notesFile])
}

if (!skipSourceforge) {
  run(path.join(__dirname, 'publish-sourceforge-release.cjs'), [version])
}

console.log('\nRelease published.')
