import { describe, expect, it } from 'vitest'
import {
  GITHUB_UPDATE_FEED,
  SOURCEFORGE_UPDATE_URL,
  sourceforgeFeed
} from '../../src/shared/update-feeds'

describe('update-feeds', () => {
  it('uses a trailing-slash SourceForge generic URL', () => {
    expect(SOURCEFORGE_UPDATE_URL.endsWith('/')).toBe(true)
    expect(SOURCEFORGE_UPDATE_URL).toContain('/googlefotomanager/releases/')
    expect(sourceforgeFeed()).toEqual({
      provider: 'generic',
      url: SOURCEFORGE_UPDATE_URL
    })
  })

  it('keeps GitHub as fallback feed identity', () => {
    expect(GITHUB_UPDATE_FEED).toEqual({
      provider: 'github',
      owner: 'sebastianoboem',
      repo: 'GoogleFotoManager'
    })
  })
})
