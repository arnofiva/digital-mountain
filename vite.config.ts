import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000
  },
  base: "./",
  plugins: [
    copy({
      targets: [
        {
          src: "node_modules/@esri/calcite-components/dist/calcite/assets/",
          dest: "public/"
        },
        {
          src: "node_modules/@arcgis/core/assets/",
          dest: "public/"
        }
      ]
    })
  ]
});
