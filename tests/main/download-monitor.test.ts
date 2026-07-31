import { describe, expect, it } from 'vitest'
import { downloadPercent } from '../../src/main/download-monitor'

describe('downloadPercent', () => {
  it('returns 0 when total is unknown', () => {
    expect(downloadPercent(100, 0)).toBe(0)
    expect(downloadPercent(100, -1)).toBe(0)
  })

  it('computes clamped percentage from bytes', () => {
    expect(downloadPercent(0, 200)).toBe(0)
    expect(downloadPercent(50, 200)).toBe(25)
    expect(downloadPercent(200, 200)).toBe(100)
    expect(downloadPercent(250, 200)).toBe(100)
  })
})
