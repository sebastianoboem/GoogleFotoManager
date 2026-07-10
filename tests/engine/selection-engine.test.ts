import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SelectionEngine } from '../../src/engine/selection-engine'
import { createGooglePhotosGrid } from '../fixtures/google-photos-grid'

describe('SelectionEngine', () => {
  let engine: SelectionEngine

  beforeEach(() => {
    vi.useFakeTimers()
    engine = new SelectionEngine()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'https://photos.google.com/' }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('selects all photos and skips Salva tutte', async () => {
    const grid = createGooglePhotosGrid(document, { photoCount: 12, virtualize: false })
    const doneEvents: { total: number; leftovers: number }[] = []
    engine.setCallbacks({ onDone: (e) => doneEvents.push(e) })

    const startPromise = engine.start({
      clickDelay: 0,
      settleDelay: 10,
      scrollFraction: 100,
      passesPerStep: 1,
      stallPasses: 2
    })

    await vi.runAllTimersAsync()
    await startPromise

    expect(grid.getSelectedCount()).toBe(12)
    expect(grid.mainEl.querySelector('[data-clicked="1"]')).toBeNull()
    expect(doneEvents[0]?.total).toBe(12)
  })

  it('counts selections correctly with virtualization', async () => {
    createGooglePhotosGrid(document, { photoCount: 30, viewportHeight: 200, itemHeight: 80 })
    const progress: number[] = []
    engine.setCallbacks({ onProgress: (e) => progress.push(e.selected) })

    const startPromise = engine.start({
      clickDelay: 0,
      settleDelay: 5,
      scrollFraction: 50,
      passesPerStep: 2,
      stallPasses: 3
    })

    await vi.runAllTimersAsync()
    await startPromise

    const maxSelected = Math.max(...progress)
    expect(maxSelected).toBe(30)
  })

  it('honors pause and stop', async () => {
    createGooglePhotosGrid(document, { photoCount: 50, virtualize: false })
    const resets: { state: string; selected: number; estPct: number }[] = []
    engine.setCallbacks({
      onProgress: (e) => {
        if (e.state === 'idle' && e.selected === 0) {
          resets.push({ state: e.state, selected: e.selected, estPct: e.estPct })
        }
      }
    })

    const startPromise = engine.start({
      clickDelay: 10,
      settleDelay: 10,
      scrollFraction: 100,
      passesPerStep: 1,
      stallPasses: 10
    })

    await vi.advanceTimersByTimeAsync(50)
    engine.pause()
    expect(engine.getState()).toBe('paused')

    engine.resume()
    expect(engine.getState()).toBe('running')

    await vi.advanceTimersByTimeAsync(50)
    const stopPromise = engine.stop()
    await vi.runAllTimersAsync()
    await stopPromise
    expect(engine.getState()).toBe('idle')
    expect(resets.length).toBeGreaterThan(0)

    await vi.runAllTimersAsync()
    await startPromise
  })

  it('deselect clicks Cancella selezione', async () => {
    const grid = createGooglePhotosGrid(document, { photoCount: 5, virtualize: false })
    grid.mainEl.querySelectorAll('[role="checkbox"][data-photo]').forEach((cb) => {
      ;(cb as HTMLElement).click()
    })
    expect(grid.getSelectedCount()).toBe(5)

    const clearBtn = document.createElement('button')
    clearBtn.setAttribute('aria-label', 'Cancella selezione')
    clearBtn.addEventListener('click', () => {
      grid.mainEl
        .querySelectorAll('[role="checkbox"][aria-checked="true"]')
        .forEach((cb) => cb.setAttribute('aria-checked', 'false'))
    })
    document.body.appendChild(clearBtn)

    await engine.deselect()
    expect(grid.getSelectedCount()).toBe(0)
    expect(engine.getState()).toBe('idle')
  })

  it('emits error when selectors missing', async () => {
    document.body.innerHTML = '<div>empty</div>'
    const errors: string[] = []
    engine.setCallbacks({ onError: (e) => errors.push(e.message) })

    await engine.start({ clickDelay: 0, settleDelay: 0, scrollFraction: 80, passesPerStep: 1, stallPasses: 1 })
    expect(errors.length).toBe(1)
    expect(engine.getState()).toBe('error')
  })
})
