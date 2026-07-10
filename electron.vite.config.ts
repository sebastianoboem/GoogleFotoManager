import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          panel: resolve(__dirname, 'src/preload/panel.ts'),
          photos: resolve(__dirname, 'src/preload/photos.ts'),
          log: resolve(__dirname, 'src/preload/log.ts'),
          'tutorial-overlay': resolve(__dirname, 'src/preload/tutorial-overlay.ts')
        }
      }
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          panel: resolve(__dirname, 'src/renderer/panel/index.html'),
          log: resolve(__dirname, 'src/renderer/log/index.html'),
          'tutorial-overlay': resolve(__dirname, 'src/renderer/tutorial-overlay/index.html'),
          'chrome-placeholder': resolve(
            __dirname,
            'src/renderer/chrome-placeholder/index.html'
          )
        }
      }
    }
  }
})
