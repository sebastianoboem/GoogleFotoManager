import { describe, expect, it } from 'vitest'
import { DEFAULT_SELECTION_PARAMS, isDefaultInRange, PARAM_RANGES } from '../../src/shared/settings-defaults'

describe('settings defaults', () => {
  it('defaults are within defined ranges', () => {
    expect(isDefaultInRange()).toBe(true)
  })

  it('each default value respects min/max', () => {
    const p = DEFAULT_SELECTION_PARAMS
    expect(p.clickDelay).toBeGreaterThanOrEqual(PARAM_RANGES.clickDelay.min)
    expect(p.clickDelay).toBeLessThanOrEqual(PARAM_RANGES.clickDelay.max)
    expect(p.scrollFraction).toBeGreaterThanOrEqual(PARAM_RANGES.scrollFraction.min)
    expect(p.scrollFraction).toBeLessThanOrEqual(PARAM_RANGES.scrollFraction.max)
    expect(p.settleDelay).toBeGreaterThanOrEqual(PARAM_RANGES.settleDelay.min)
    expect(p.settleDelay).toBeLessThanOrEqual(PARAM_RANGES.settleDelay.max)
    expect(p.passesPerStep).toBeGreaterThanOrEqual(PARAM_RANGES.passesPerStep.min)
    expect(p.passesPerStep).toBeLessThanOrEqual(PARAM_RANGES.passesPerStep.max)
    expect(p.stallPasses).toBeGreaterThanOrEqual(PARAM_RANGES.stallPasses.min)
    expect(p.stallPasses).toBeLessThanOrEqual(PARAM_RANGES.stallPasses.max)
  })
})
