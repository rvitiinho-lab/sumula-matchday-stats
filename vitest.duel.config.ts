import { defineConfig } from 'vitest/config';
// Database integration tests need native Node Blob and WebAssembly, not jsdom.
export default defineConfig({ test: { environment: 'node', include: ['src/lib/duel-database.test.ts'], testTimeout: 30000 } });