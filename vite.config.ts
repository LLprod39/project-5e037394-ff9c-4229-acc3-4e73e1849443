import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const defaultAllowedHosts = [
    "localhost",
    "127.0.0.1",
    ".ngrok-free.app",
    ".ngrok.app",
    ".ngrok.io",
    ".loca.lt",
    ".trycloudflare.com",
  ];
  const extraAllowedHosts = (env.ALLOWED_HOSTS || env.__APP_ALLOWED_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  const allowedHosts = [...new Set([...defaultAllowedHosts, ...extraAllowedHosts])];

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_TARGET || "http://127.0.0.1:3001",
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});
