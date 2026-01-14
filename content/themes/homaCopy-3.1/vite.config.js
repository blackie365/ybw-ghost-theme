import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

import tailwindcss from "@tailwindcss/vite";
import iconFontGenerator from "@bravobit/icon-font-generator";

// Custom Vite plugin for icon font generation
function iconFontPlugin() {
  return {
    name: "vite-plugin-icon-font",
    enforce: "pre",
    async buildStart() {
      await generateIconFont();
    },
    // Add watcher for SVG files
    configureServer(server) {
      server.watcher.add(resolve(__dirname, "assets/icons/**/*.svg"));
      server.watcher.on("add", async (path) => {
        if (path.endsWith(".svg") && path.includes("assets/icons")) {
          console.log("New SVG detected:", path);
          await generateIconFont();
        }
      });
      server.watcher.on("change", async (path) => {
        if (path.endsWith(".svg") && path.includes("assets/icons")) {
          console.log("SVG updated:", path);
          await generateIconFont();
        }
      });
    },
    // Copy generated fonts to build directory
    async generateBundle(options, bundle) {
      try {
        // Ensure fonts are generated
        await generateIconFont();

        const fontFiles = ["ttf", "woff", "woff2", "svg"];

        for (const ext of fontFiles) {
          const filePath = resolve(
            __dirname,
            `assets/build/fonts/icons.${ext}`
          );
          if (fs.existsSync(filePath)) {
            bundle[`fonts/icons.${ext}`] = {
              type: "asset",
              fileName: `fonts/icons.${ext}`,
              source: fs.readFileSync(filePath),
            };
          }
        }
      } catch (err) {
        console.error("Error in generateBundle:", err);
      }
    },
  };
}

// Extracted icon font generation logic into a separate function
async function generateIconFont() {
  try {
    const inputDirectory = resolve(__dirname, "assets/icons");
    const outputDirectory = resolve(__dirname, "assets/build/fonts");

    // Ensure output directory exists
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    await iconFontGenerator({
      input: inputDirectory,
      output: outputDirectory,
      name: "icons",
      types: ["svg", "ttf", "woff", "woff2"],
    });

    console.log("✓ Icon font generated successfully");
  } catch (error) {
    console.error("Error generating icon font:", error);
    throw error;
  }
}

export default defineConfig({
  build: {
    outDir: "assets/build",
    assetsDir: ".",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "assets/js/main.ts"),
        style: resolve(__dirname, "assets/css/index.css"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },

  plugins: [tailwindcss(), iconFontPlugin()],

  css: {
    postcss: "./postcss.config.js",
    devSourcemap: true,
  },

  publicDir: false,

  watch: {
    include: ["**/*"],
    exclude: ["node_modules/**", "assets/build/**"],
  },
});
