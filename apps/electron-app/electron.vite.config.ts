import path from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': path.resolve(__dirname, 'src/main'),
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    build: {
      watch: {},
      rollupOptions: {
        external: [
          'better-sqlite3',
          'electron-updater',
          'interprocess',
          'node-pre-gyp',
          /better-sqlite3\/.*/
        ]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': path.resolve(__dirname, 'src/preload'),
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    build: {
      watch: {}
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer/src'),
        '@renderer': path.resolve(__dirname, 'src/renderer/src'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@/components': path.resolve(__dirname, 'src/renderer/src/components'),
        '@/hooks': path.resolve(__dirname, 'src/renderer/src/hooks'),
        '@/lib': path.resolve(__dirname, 'src/renderer/src/lib'),
        '@/ui': path.resolve(__dirname, 'src/renderer/src/components/ui'),
        '@/utils': path.resolve(__dirname, 'src/renderer/src/lib/utils')
      }
    },
    plugins: [react()]
  }
})
