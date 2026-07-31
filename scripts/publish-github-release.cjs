#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { userReleaseFiles } = require('./rename-artifacts.cjs')

const version = process.argv[2]
const notesFile = process.argv[3]

if (!version || !notesFile) {
  console.error('Usage: node scripts/publish-github-release.cjs <version> <notes-file>')
  process.exit(1)
}

const files = userReleaseFiles(version)
for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing release file: ${filePath}`)
    process.exit(1)
  }
}

const notes = fs.readFileSync(notesFile, 'utf8')
const args = [
  'release',
  'create',
  `v${version}`,
  ...files,
  '--repo',
  'sebastianoboem/GoogleFotoManager',
  '--title',
  `v${version}`,
  '--notes',
  notes
]

const result = spawnSync('gh', args, { stdio: 'inherit' })
process.exit(result.status ?? 1)
