import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // we have to run the files sequentially, due to a shared deployer private key.
    // this is only problemmatic for test files that use the deployer account directly.
    // we should try to find a better solution.
    // within a single test file, we can use the Mutex found in test/utils/Mutex.ts to
    // lock the resource when using it.
    fileParallelism: false,
    setupFiles: ['./src/setup.ts'],
    include: ['test/**/*.test.ts'],
    exclude: ['contracts/**'],
  },
});
