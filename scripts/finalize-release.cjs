#!/usr/bin/env node
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {
  githubAssetName,
  readVersion,
  releaseDir,
  userReleaseFiles
} = require('./rename-artifacts.cjs')

function sha512Base64(filePath) {
  return crypto.createHash('sha512').update(fs.readFileSync(filePath)).digest('base64')
}

function findExe(version) {
  const names = fs.readdirSync(releaseDir)
  const exe = names.find(
    (n) => n.endsWith('.exe') && n.includes(version) && !/-(x64|arm64)\.exe$/i.test(n)
  )
  if (!exe) throw new Error(`Windows installer not found in ${releaseDir}`)
  return path.join(releaseDir, exe)
}

function writeLatestYml(version, exePath) {
  const localName = path.basename(exePath)
  const assetName = githubAssetName(localName)
  const sha = sha512Base64(exePath)
  const body = [
    `version: ${version}`,
    'files:',
    `  - url: ${assetName}`,
    `    sha512: ${sha}`,
    `path: ${assetName}`,
    `sha512: ${sha}`,
    `releaseDate: '${new Date().toISOString()}'`,
    ''
  ].join('\n')
  fs.writeFileSync(path.join(releaseDir, 'latest.yml'), body)
  console.log(`Wrote latest.yml → ${assetName}`)
}

function cleanupReleaseDir(version) {
  let keepInstallers = []
  try {
    keepInstallers = userReleaseFiles(version).map((filePath) => path.basename(filePath))
  } catch {
    keepInstallers = fs
      .readdirSync(releaseDir)
      .filter(
        (name) =>
          (name.endsWith('.exe') && name.includes(version) && !/-(x64|arm64)\.exe$/i.test(name)) ||
          (name.endsWith('.dmg') && (name.includes('AppleSilicon') || name.includes('Intel')))
      )
  }

  const keep = new Set([...keepInstallers, 'latest.yml'])

  for (const name of fs.readdirSync(releaseDir)) {
    if (keep.has(name)) continue
    fs.rmSync(path.join(releaseDir, name), { recursive: true, force: true })
  }

  const remaining = fs.readdirSync(releaseDir).sort()
  console.log(`release/ contents: ${remaining.join(', ')}`)
  if (!remaining.includes('latest.yml')) {
    throw new Error('latest.yml missing after finalize')
  }
}

const version = readVersion()
if (!fs.existsSync(releaseDir)) {
  console.error(`Missing ${releaseDir}`)
  process.exit(1)
}

const exePath = findExe(version)
writeLatestYml(version, exePath)
cleanupReleaseDir(version)
