// vite.config.ts
import { defineConfig } from "file:///E:/cafe-ts/cafeapp/node_modules/vite/dist/node/index.js";
import react from "file:///E:/cafe-ts/cafeapp/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import rollupNodePolyFill from "file:///E:/cafe-ts/cafeapp/node_modules/rollup-plugin-node-polyfills/dist/index.js";
import { NodeGlobalsPolyfillPlugin } from "file:///E:/cafe-ts/cafeapp/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import fs from "fs";
import svgr from "file:///E:/cafe-ts/cafeapp/node_modules/vite-plugin-svgr/dist/index.mjs";
import viteCompression from "file:///E:/cafe-ts/cafeapp/node_modules/vite-plugin-compression/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\cafe-ts\\cafeapp";
var replace = (val) => {
  return val.replace(/^~/, "");
};
var vite_config_default = defineConfig({
  plugins: [
    viteCompression({
      algorithm: "brotliCompress"
    }),
    react(),
    svgr({
      svgrOptions: {
        titleProp: false
      }
    })
  ],
  define: {
    global: "globalThis"
  },
  server: {
    port: 3e3,
    cors: {
      origin: ["https://pixinvent.com/", "http://localhost:3000"],
      methods: ["GET", "PATCH", "PUT", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ["node_modules", "./src/assets"]
      }
    }
    // postcss: {
    //   plugins: [require("postcss-rtl")()],
    // },
  },
  resolve: {
    alias: [
      {
        find: /^~.+/,
        // replacement: '',
        replacement: replace
      },
      {
        find: "stream",
        replacement: "stream-browserify"
      },
      { find: "stream", replacement: "stream-browserify" },
      { find: "crypto", replacement: "crypto-browserify" },
      { find: "@src", replacement: path.resolve(__vite_injected_original_dirname, "src") },
      { find: "@store", replacement: path.resolve(__vite_injected_original_dirname, "src/redux") },
      { find: "@configs", replacement: path.resolve(__vite_injected_original_dirname, "src/configs") },
      {
        find: "url",
        replacement: "rollup-plugin-node-polyfills/polyfills/url"
      },
      {
        find: "@styles",
        replacement: path.resolve(__vite_injected_original_dirname, "src/@core/scss")
      },
      {
        find: "util",
        replacement: "rollup-plugin-node-polyfills/polyfills/util"
      },
      {
        find: "zlib",
        replacement: "rollup-plugin-node-polyfills/polyfills/zlib"
      },
      {
        find: "@utils",
        replacement: path.resolve(__vite_injected_original_dirname, "src/utility/Utils")
      },
      {
        find: "@hooks",
        replacement: path.resolve(__vite_injected_original_dirname, "src/utility/hooks")
      },
      {
        find: "@assets",
        replacement: path.resolve(__vite_injected_original_dirname, "src/@core/assets")
      },
      {
        find: "@@assets",
        replacement: path.resolve(__vite_injected_original_dirname, "src/assets")
      },
      {
        find: "@layouts",
        replacement: path.resolve(__vite_injected_original_dirname, "src/@core/layouts")
      },
      {
        find: "assert",
        replacement: "rollup-plugin-node-polyfills/polyfills/assert"
      },
      {
        find: "buffer",
        replacement: "rollup-plugin-node-polyfills/polyfills/buffer-es6"
      },
      {
        find: "process",
        replacement: "rollup-plugin-node-polyfills/polyfills/process-es6"
      },
      {
        find: "@components",
        replacement: path.resolve(__vite_injected_original_dirname, "src/@core/components")
      },
      {
        find: "@@components",
        replacement: path.resolve(__vite_injected_original_dirname, "src/views/components")
      },
      {
        find: "@modules",
        replacement: path.resolve(__vite_injected_original_dirname, "src/modules")
      }
    ]
  },
  //   esbuild: {
  //     // loader: 'jsx',
  //     // include: /.\/src\/.*\.js?$/,
  //     // exclude: [],
  //     jsx: 'automatic'
  //   },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
              loader: "jsx",
              contents: await fs.readFileSync(args.path, "utf8")
            }));
          }
        }
      ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxjYWZlLXRzXFxcXGNhZmVhcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGNhZmUtdHNcXFxcY2FmZWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovY2FmZS10cy9jYWZlYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgcm9sbHVwTm9kZVBvbHlGaWxsIGZyb20gJ3JvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnXHJcbmltcG9ydCB7IE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4gfSBmcm9tICdAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbCdcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xyXG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJ1xyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJztcclxuXHJcbmNvbnN0IHJlcGxhY2U6IGFueSA9ICh2YWwpID0+IHtcclxuICByZXR1cm4gdmFsLnJlcGxhY2UoL15+LywgJycpXHJcbn1cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcydcclxuICAgIH0pLFxyXG4gICAgcmVhY3QoKSxcclxuICAgIHN2Z3Ioe1xyXG4gICAgICBzdmdyT3B0aW9uczoge1xyXG4gICAgICAgIHRpdGxlUHJvcDogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSlcclxuICBdLFxyXG4gIGRlZmluZToge1xyXG4gICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcydcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIGNvcnM6IHtcclxuICAgICAgb3JpZ2luOiBbJ2h0dHBzOi8vcGl4aW52ZW50LmNvbS8nLCAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ10sXHJcbiAgICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BBVENIJywgJ1BVVCcsICdQT1NUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXHJcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJywgJ1gtUmVxdWVzdGVkLVdpdGgnXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNjc3M6IHtcclxuICAgICAgICBpbmNsdWRlUGF0aHM6IFsnbm9kZV9tb2R1bGVzJywgJy4vc3JjL2Fzc2V0cyddXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHBvc3Rjc3M6IHtcclxuICAgIC8vICAgcGx1Z2luczogW3JlcXVpcmUoXCJwb3N0Y3NzLXJ0bFwiKSgpXSxcclxuICAgIC8vIH0sXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogL15+LisvLFxyXG4gICAgICAgIC8vIHJlcGxhY2VtZW50OiAnJyxcclxuICAgICAgICByZXBsYWNlbWVudDogcmVwbGFjZVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ3N0cmVhbScsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICdzdHJlYW0tYnJvd3NlcmlmeSdcclxuICAgICAgfSxcclxuICAgICAgeyBmaW5kOiAnc3RyZWFtJywgcmVwbGFjZW1lbnQ6ICdzdHJlYW0tYnJvd3NlcmlmeScgfSxcclxuICAgICAgeyBmaW5kOiAnY3J5cHRvJywgcmVwbGFjZW1lbnQ6ICdjcnlwdG8tYnJvd3NlcmlmeScgfSxcclxuICAgICAgeyBmaW5kOiAnQHNyYycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJykgfSxcclxuICAgICAgeyBmaW5kOiAnQHN0b3JlJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcmVkdXgnKSB9LFxyXG4gICAgICB7IGZpbmQ6ICdAY29uZmlncycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbmZpZ3MnKSB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ3VybCcsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICdyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy91cmwnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiAnQHN0eWxlcycsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvQGNvcmUvc2NzcycpXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiAndXRpbCcsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICdyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy91dGlsJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ3psaWInLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiAncm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvemxpYidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdAdXRpbHMnLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3V0aWxpdHkvVXRpbHMnKVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ0Bob29rcycsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdXRpbGl0eS9ob29rcycpXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiAnQGFzc2V0cycsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvQGNvcmUvYXNzZXRzJylcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdAQGFzc2V0cycsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvYXNzZXRzJylcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdAbGF5b3V0cycsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvQGNvcmUvbGF5b3V0cycpXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiAnYXNzZXJ0JyxcclxuICAgICAgICByZXBsYWNlbWVudDogJ3JvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL2Fzc2VydCdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdidWZmZXInLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiAncm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvYnVmZmVyLWVzNidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdwcm9jZXNzJyxcclxuICAgICAgICByZXBsYWNlbWVudDogJ3JvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3Byb2Nlc3MtZXM2J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ0Bjb21wb25lbnRzJyxcclxuICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9AY29yZS9jb21wb25lbnRzJylcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdAQGNvbXBvbmVudHMnLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3ZpZXdzL2NvbXBvbmVudHMnKVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ0Btb2R1bGVzJyxcclxuICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9tb2R1bGVzJylcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgLy8gICBlc2J1aWxkOiB7XHJcbiAgLy8gICAgIC8vIGxvYWRlcjogJ2pzeCcsXHJcbiAgLy8gICAgIC8vIGluY2x1ZGU6IC8uXFwvc3JjXFwvLipcXC5qcz8kLyxcclxuICAvLyAgICAgLy8gZXhjbHVkZTogW10sXHJcbiAgLy8gICAgIGpzeDogJ2F1dG9tYXRpYydcclxuICAvLyAgIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBsb2FkZXI6IHtcclxuICAgICAgICAnLmpzJzogJ2pzeCdcclxuICAgICAgfSxcclxuICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgIE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4oe1xyXG4gICAgICAgICAgYnVmZmVyOiB0cnVlLFxyXG4gICAgICAgICAgcHJvY2VzczogdHJ1ZVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6ICdsb2FkLWpzLWZpbGVzLWFzLWpzeCcsXHJcbiAgICAgICAgICBzZXR1cChidWlsZCkge1xyXG4gICAgICAgICAgICBidWlsZC5vbkxvYWQoeyBmaWx0ZXI6IC9zcmNcXFxcLipcXC5qcyQvIH0sIGFzeW5jIChhcmdzKSA9PiAoe1xyXG4gICAgICAgICAgICAgIGxvYWRlcjogJ2pzeCcsXHJcbiAgICAgICAgICAgICAgY29udGVudHM6IGF3YWl0IGZzLnJlYWRGaWxlU3luYyhhcmdzLnBhdGgsICd1dGY4JylcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBwbHVnaW5zOiBbcm9sbHVwTm9kZVBvbHlGaWxsKCldXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThPLFNBQVMsb0JBQW9CO0FBQzNRLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyx3QkFBd0I7QUFDL0IsU0FBUyxpQ0FBaUM7QUFDMUMsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLE9BQU8scUJBQXFCO0FBUDVCLElBQU0sbUNBQW1DO0FBU3pDLElBQU0sVUFBZSxDQUFDLFFBQVE7QUFDNUIsU0FBTyxJQUFJLFFBQVEsTUFBTSxFQUFFO0FBQzdCO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsZ0JBQWdCO0FBQUEsTUFDWixXQUFXO0FBQUEsSUFDZixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxhQUFhO0FBQUEsUUFDWCxXQUFXO0FBQUEsTUFDYjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsTUFDSixRQUFRLENB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
