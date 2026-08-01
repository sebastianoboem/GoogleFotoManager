export const SF_PROJECT_DEFAULT = 'googlefotomanager'

/** Stable generic feed directory (trailing slash required). */
export const SOURCEFORGE_UPDATE_URL =
  `https://downloads.sourceforge.net/project/${SF_PROJECT_DEFAULT}/releases/`

export const GITHUB_UPDATE_FEED = {
  provider: 'github' as const,
  owner: 'sebastianoboem',
  repo: 'GoogleFotoManager'
}

export function sourceforgeFeed(url = SOURCEFORGE_UPDATE_URL) {
  return {
    provider: 'generic' as const,
    url
  }
}
