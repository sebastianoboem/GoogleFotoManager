const fs = require('node:fs')

const MAC_RENAMES = new Map([
  ['-arm64.dmg', '-arm64-AppleSilicon.dmg'],
  ['-x64.dmg', '-x64-Intel.dmg'],
  ['-arm64.dmg.blockmap', '-arm64-AppleSilicon.dmg.blockmap'],
  ['-x64.dmg.blockmap', '-x64-Intel.dmg.blockmap']
])

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

    updated.push(current)
  }

  return updated
}
