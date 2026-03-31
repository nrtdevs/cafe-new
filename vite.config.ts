// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// import react from '@vitejs/plugin-react'
// import fs from 'fs'
// import path from 'path'
// import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
// import { defineConfig } from 'vite'
// import viteCompression from 'vite-plugin-compression'
// import svgr from 'vite-plugin-svgr'

// const replace: any = (val) => {
//   return val.replace(/^~/, '')
// }

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     viteCompression({
//       algorithm: 'brotliCompress'
//     }),
//     react(),
//     svgr({
//       svgrOptions: {
//         titleProp: false
//       }
//     })
//   ],
//   define: {
//     global: 'window',
//     'process.env': {}
//   },
//   server: {
//     port: 3000,
//     cors: {
//       origin: ['https://pixinvent.com/', 'http://localhost:3000'],
//       methods: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
//       allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
//     }
//   },
//   css: {
//     preprocessorOptions: {
//       scss: {
//         includePaths: ['node_modules', './src/assets'],
//         quietDeps: true // 🔥 MOST IMPORTANT FIX
//       }
//     }
//     // postcss: {
//     //   plugins: [require("postcss-rtl")()],
//     // },
//   },
//   resolve: {
//     mainFields: ['browser', 'module', 'main'],
//     alias: [
//       {
//         find: /^~.+/,
//         // replacement: '',
//         replacement: replace
//       },
//       {
//         find: 'stream',
//         replacement: 'stream-browserify'
//       },
//       { find: 'stream', replacement: 'stream-browserify' },
//       { find: 'crypto', replacement: 'crypto-browserify' },
//       { find: '@src', replacement: path.resolve(__dirname, 'src') },
//       { find: '@store', replacement: path.resolve(__dirname, 'src/redux') },
//       { find: '@configs', replacement: path.resolve(__dirname, 'src/configs') },
//       {
//         find: 'url',
//         replacement: 'rollup-plugin-node-polyfills/polyfills/url'
//       },
//       {
//         find: '@styles',
//         replacement: path.resolve(__dirname, 'src/@core/scss')
//       },
//       {
//         find: 'util',
//         replacement: 'rollup-plugin-node-polyfills/polyfills/util'
//       },
//       {
//         find: 'zlib',
//         replacement: 'rollup-plugin-node-polyfills/polyfills/zlib'
//       },
//       {
//         find: '@utils',
//         replacement: path.resolve(__dirname, 'src/utility/Utils')
//       },
//       {
//         find: '@hooks',
//         replacement: path.resolve(__dirname, 'src/utility/hooks')
//       },
//       {
//         find: '@assets',
//         replacement: path.resolve(__dirname, 'src/@core/assets')
//       },
//       {
//         find: '@@assets',
//         replacement: path.resolve(__dirname, 'src/assets')
//       },
//       {
//         find: '@layouts',
//         replacement: path.resolve(__dirname, 'src/@core/layouts')
//       },
//       {
//         find: 'assert',
//         replacement: 'rollup-plugin-node-polyfills/polyfills/assert'
//       },
//       {
//         find: 'buffer',
//         replacement: 'rollup-plugin-node-polyfills/polyfills/buffer-es6'
//       },
//       {
//         find: '@components',
//         replacement: path.resolve(__dirname, 'src/@core/components')
//       },
//       {
//         find: '@@components',
//         replacement: path.resolve(__dirname, 'src/views/components')
//       },
//       {
//         find: '@modules',
//         replacement: path.resolve(__dirname, 'src/modules')
//       }
//     ]
//   },
//   //   esbuild: {
//   //     // loader: 'jsx',
//   //     // include: /.\/src\/.*\.js?$/,
//   //     // exclude: [],
//   //     jsx: 'automatic'
//   //   },
//   optimizeDeps: {
//     include: ['react-router-dom', 'react-router', 'history', 'axios'],
//     esbuildOptions: {
//       loader: {
//         '.js': 'jsx'
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           buffer: true,
//           process: true
//         }),
//         {
//           name: 'load-js-files-as-jsx',
//           setup(build) {
//             build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
//               loader: 'jsx',
//               contents: await fs.readFileSync(args.path, 'utf8')
//             }))
//           }
//         }
//       ]
//     }
//   },
//   build: {
//     commonjsOptions: {
//       transformMixedEsModules: true
//     },
//     rollupOptions: {
//       plugins: [rollupNodePolyFill()]
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import fs from 'fs'

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import viteCompression from 'vite-plugin-compression'

const isProd = process.env.NODE_ENV === 'production'

const replace = (val: string) => val.replace(/^~/, '')

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        titleProp: false
      }
    }),

    // 🔒 Production only
    ...(isProd
      ? [
        viteCompression({
          algorithm: 'brotliCompress'
        })
      ]
      : [])
  ],


  define: {
    global: 'window',
    'process.env': {}
  },

  server: {
    port: 3000,
    cors: {
      origin: ['https://pixinvent.com/', 'http://localhost:3000'],
      methods: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules', './src/assets'],
        quietDeps: true
      }
    }
  },

  resolve: {
    mainFields: ['browser', 'module', 'main'],
    alias: [
      // FIXED ~ import support
      { find: /^~(.*)/, replacement: '$1' },

      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'crypto', replacement: 'crypto-browserify' },
      { find: 'buffer', replacement: 'rollup-plugin-node-polyfills/polyfills/buffer-es6' },
      { find: 'util', replacement: 'rollup-plugin-node-polyfills/polyfills/util' },
      { find: 'zlib', replacement: 'rollup-plugin-node-polyfills/polyfills/zlib' },
      { find: 'assert', replacement: 'rollup-plugin-node-polyfills/polyfills/assert' },
      { find: 'url', replacement: 'rollup-plugin-node-polyfills/polyfills/url' },

      { find: '@src', replacement: path.resolve(__dirname, 'src') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/redux') },
      { find: '@configs', replacement: path.resolve(__dirname, 'src/configs') },
      { find: '@styles', replacement: path.resolve(__dirname, 'src/@core/scss') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utility/Utils') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/utility/hooks') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/@core/assets') },
      { find: '@@assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '@layouts', replacement: path.resolve(__dirname, 'src/@core/layouts') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/@core/components') },
      { find: '@@components', replacement: path.resolve(__dirname, 'src/views/components') },
      { find: '@modules', replacement: path.resolve(__dirname, 'src/modules') }
    ]
  },
  optimizeDeps: {
    include: ['react-router-dom', 'react-router', 'history', 'axios'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      },
      plugins: [
        // Needed only for dev
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),

        // ⚠️ Keep ONLY if you still have .js files with JSX
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: 'jsx',
              contents: fs.readFileSync(args.path, 'utf8')
            }))
          }
        }
      ]
    }
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      plugins: isProd ? [rollupNodePolyFill()] : []
    }
  }
})

