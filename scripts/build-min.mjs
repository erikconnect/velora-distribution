/* Builds dist/motion-core.min.css: one minified file with every @import inlined,
 * for CDN and plain-HTML use. `--check` rebuilds in memory and fails if the
 * committed file differs. lightningcss is not used: it drops one attr() and one @supports. */
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const OUTFILE = 'dist/motion-core.min.css';
const result = await build({
  entryPoints: ['src/motion-core.css'],
  bundle: true,
  minify: true,
  write: false,
  outfile: OUTFILE,
  target: ['chrome124', 'safari18', 'firefox128'],
  logLevel: 'warning',
});
const css = result.outputFiles[0].text;

if (process.argv.includes('--check')) {
  if (readFileSync(OUTFILE, 'utf8') !== css) {
    console.error(`${OUTFILE} is stale: run npm run build:min`);
    process.exit(1);
  }
  console.log(`${OUTFILE} matches src.`);
} else {
  writeFileSync(OUTFILE, css);
  console.log(`${OUTFILE}: ${css.length} bytes`);
}
