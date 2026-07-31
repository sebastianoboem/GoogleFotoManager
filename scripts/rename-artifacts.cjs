const fs = require('node:fs')
const path = require('node:path')

const releaseDir = path.join(__dirname, '..', 'release')
const MAC_RENAMES = new Map([
  ['-arm64.dmg', '-arm64-AppleSilicon.dmg'],
  ['-x64.dmg', '-x64-Intel.dmg']
])

function readVersion() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  )
  return pkg.version
}

function userReleaseFiles(version, dir = releaseDir) {
  const names = fs.readdirSync(dir)
  const exe = names.find(
    (n) => n.endsWith('.exe') && n.includes(version) && !/-(x64|arm64)\.exe$/i.test(n)
  )
  const dmgArm = names.find((n) => n.endsWith('.dmg') && n.includes('AppleSilicon'))
  const dmgIntel = names.find((n) => n.endsWith('.dmg') && n.includes('Intel'))
  if (!exe || !dmgArm || !dmgIntel) {
    throw new Error(
      `Expected 3 release files in ${dir} (exe + 2 dmg), found: ${names.join(', ')}`
    )
  }
  return [exe, dmgArm, dmgIntel].map((name) => path.join(dir, name))
}

function isUserReleaseComplete(version, dir = releaseDir) {
  try {
    userReleaseFiles(version, dir)
    return true
  } catch {
    return false
  }
}

function sanitizeReleaseDir() {
  if (!fs.existsSync(releaseDir)) return

  for (const name of fs.readdirSync(releaseDir)) {
    const full = path.join(releaseDir, name)
    const stat = fs.statSync(full)

    if (stat.isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true })
      continue
    }

    if (
      name.endsWith('.zip') ||
      name.endsWith('.blockmap') ||
      name.endsWith('.yml') ||
      name.endsWith('.yaml') ||
      name.endsWith('.7z') ||
      /-(x64|arm64)\.exe$/i.test(name)
    ) {
      fs.unlinkSync(full)
    }
  }
}

function pruneReleaseDir(version) {
  const keep = new Set(userReleaseFiles(version).map((filePath) => path.basename(filePath)))

  for (const name of fs.readdirSync(releaseDir)) {
    if (keep.has(name)) continue
    fs.rmSync(path.join(releaseDir, name), { recursive: true, force: true })
  }

  const remaining = fs.readdirSync(releaseDir)
  if (remaining.length !== 3) {
    throw new Error(
      `release/ must contain exactly 3 files, found ${remaining.length}: ${remaining.join(', ')}`
    )
  }
}

function finalizeReleaseDir(version) {
  sanitizeReleaseDir()
  if (isUserReleaseComplete(version)) {
    pruneReleaseDir(version)
  }
}

/** @param {import('app-builder-lib').BuildResult} buildResult */
module.exports = async function renameArtifacts(buildResult) {
  const version = readVersion()

  for (const artifact of buildResult.artifactPaths) {
    let current = artifact

    for (const [from, to] of MAC_RENAMES) {
      if (current.endsWith(from)) {
        const dest = current.slice(0, -from.length) + to
        fs.renameSync(current, dest)
        break
      }
    }

    if (/-(x64|arm64)\.exe$/i.test(current) && fs.existsSync(current)) {
      fs.unlinkSync(current)
    }
  }

  finalizeReleaseDir(version)
  return isUserReleaseComplete(version) ? userReleaseFiles(version) : buildResult.artifactPaths
}

module.exports.userReleaseFiles = userReleaseFiles
module.exports.finalizeReleaseDir = finalizeReleaseDir
module.exports.readVersion = readVersion
