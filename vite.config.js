import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ttsHandler from "./api/tts.js";

function createTtsMiddleware() {
  return async (req, res) => {
    const parsedUrl = new URL(req.url || "/", "http://localhost");
    const query = Object.fromEntries(parsedUrl.searchParams.entries());

    const vercelReq = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query,
    };

    const vercelRes = {
      statusCode: 200,
      setHeader(name, value) {
        res.setHeader(name, value);
        return this;
      },
      status(code) {
        this.statusCode = code;
        res.statusCode = code;
        return this;
      },
      json(payload) {
        if (!res.getHeader("Content-Type")) {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
        }
        res.end(JSON.stringify(payload));
        return this;
      },
      send(body) {
        res.end(body);
        return this;
      },
      end(body) {
        res.end(body);
        return this;
      },
    };

    try {
      await ttsHandler(vercelReq, vercelRes);
    } catch (err) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(
          JSON.stringify({
            error: err?.message || "Local TTS middleware error",
          })
        );
      }
    }
  };
}

function localApiTtsPlugin() {
  return {
    name: "local-api-tts",
    configureServer(server) {
      server.middlewares.use("/api/tts", createTtsMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/tts", createTtsMiddleware());
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiTtsPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, "/");
          if (normalized.includes("/node_modules/")) {
            if (
              normalized.includes("/node_modules/react/") ||
              normalized.includes("/node_modules/react-dom/") ||
              normalized.includes("/node_modules/scheduler/")
            ) {
              return "vendor-react";
            }
            if (normalized.includes("/node_modules/@supabase/")) {
              return "vendor-supabase";
            }
            if (normalized.includes("/node_modules/lucide-react/")) {
              return "vendor-icons";
            }
            if (normalized.includes("/node_modules/pdfjs-dist/")) {
              return "vendor-pdf";
            }
            return "vendor";
          }
          if (normalized.includes("/src/data/")) {
            return "curriculum-data";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: false,
  },
});
