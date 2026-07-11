const fs = require('node:fs')
const path = require('node:path')

const MAC_RENAMES = new Map([
  ['-arm64.dmg', '-arm64-AppleSilicon.dmg'],
  ['-x64.dmg', '-x64-Intel.dmg'],
  ['-arm64.dmg.blockmap', '-arm64-AppleSilicon.dmg.blockmap'],
  ['-x64.dmg.blockmap', '-x64-Intel.dmg.blockmap']
])

function copyHyphenatedArtifact(filePath, updated) {
  if (filePath.includes('.__uninstaller.')) return

  const base = path.basename(filePath)
  const hyphenName = base.replace(/ /g, '-')
  if (hyphenName === base) return

  const dest = path.join(path.dirname(filePath), hyphenName)
  if (fs.existsSync(dest)) return

  fs.copyFileSync(filePath, dest)
  updated.push(dest)

  const blockmap = `${filePath}.blockmap`
  if (fs.existsSync(blockmap)) {
    const hyphenBlockmap = `${dest}.blockmap`
    fs.copyFileSync(blockmap, hyphenBlockmap)
    updated.push(hyphenBlockmap)
  }
}

/** @param {import('app-builder-lib').BuildResult} buildResult */
module.exports = async function renameArtifacts(buildResult) {
  const updated = []

  for (const artifact of buildResult.artifactPaths) {
    let current = artifact

    for (const [from, to] of MAC_RENAMES) {
      if (current.endsWith(from)) {
        const dest = current.slice(0, -from.length) + to
        fs.renameSync(current, dest)
        current = dest
        break
      }
    }

    if (/-(x64|arm64)\.exe$/i.test(current)) {
      fs.unlinkSync(current)
      const blockmap = `${current}.blockmap`
      if (fs.existsSync(blockmap)) fs.unlinkSync(blockmap)
      continue
    }

    copyHyphenatedArtifact(current, updated)
    updated.push(current)
  }

  return updated
}
