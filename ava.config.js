export default {
  require: ['esm'],
  files: ['./test/esm/**/*.test.js'],
  cache: true,
  concurrency: 5,
  failFast: true,
  failWithoutAssertions: false,
  tap: false,
  verbose: false
}
