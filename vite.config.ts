import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  server: {
    port: 3000
  },
  base: "./",
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@esri/calcite-components/dist/calcite/assets/",
          dest: "./"
        },
        {
          src: "node_modules/@arcgis/core/assets/",
          dest: "./"
        },
        {
          src: "icons/",
          dest: "./"
        }
      ]
    })
  ]
});
