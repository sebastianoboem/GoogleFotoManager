#!/usr/bin/env node
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const {
  githubAssetName,
  publishReleaseFiles,
  readVersion
} = require('./rename-artifacts.cjs')

const version = process.argv[2] || readVersion()
const sfUser = process.env.SF_USER
const sfProject = process.env.SF_PROJECT || 'googlefotomanager'

if (!sfUser) {
  console.error('Set SF_USER to your SourceForge username (and ensure SSH access to frs.sourceforge.net).')
  process.exit(1)
}

const files = publishReleaseFiles(version)
for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing release file: ${filePath}`)
    process.exit(1)
  }
}

const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'gfm-sf-'))
try {
  for (const filePath of files) {
    const remoteName = githubAssetName(path.basename(filePath))
    fs.copyFileSync(filePath, path.join(staging, remoteName))
    console.log(`Stage ${remoteName}`)
  }

  const remote = `${sfUser}@frs.sourceforge.net:/home/frs/project/${sfProject}/releases/`
  console.log(`Uploading to ${remote}`)
  const result = spawnSync(
    'rsync',
    ['-avP', '-e', 'ssh', `${staging}/`, remote],
    { stdio: 'inherit' }
  )
  process.exit(result.status ?? 1)
} finally {
  fs.rmSync(staging, { recursive: true, force: true })
}
