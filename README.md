# Velora CSS

Declarative motion for modern HTML and CSS interfaces, with **zero animation runtime JavaScript** and an optional visual layer: **Velora Skins**.

[Showcase](https://veloracss.io/) · [Documentation](https://docs.veloracss.io/) · [npm package](https://www.npmjs.com/package/@veloracss.io/css) · [Release workflow](https://github.com/erikconnect/velora-distribution/actions/workflows/publish-npm.yml)

## Release status

The initial operational release is awaiting its protected publication approval. The `0.0.0-stage` npm version is a reservation placeholder, **not a usable CSS release**. Check the npm version before installing; the commands below target the planned `1.0.0` release.

## Install

Once `1.0.0` is published:

```sh
npm install @veloracss.io/css@1.0.0
```

Use a bundler that resolves package CSS imports:

```css
/* Motion only: keep your existing visual design. */
@import "@veloracss.io/css/motion-core";
```

Or use the full bundle:

```css
@import "@veloracss.io/css";
```

For plain HTML without a bundler, copy the selected CSS entrypoint **and its imported files** from the package to your static assets. Do not copy only `motion-core.css`: it imports other CSS files.

## Choose an entrypoint

| Import | Use |
| --- | --- |
| `@veloracss.io/css` / `full` | Full bundle |
| `@veloracss.io/css/base` | Base layer |
| `@veloracss.io/css/motion-core` | Host-agnostic motion |
| `@veloracss.io/css/motion-extended` | Extended motion recipes |
| `@veloracss.io/css/theme` | Optional Skins and theme layer |
| `@veloracss.io/css/components-core` | Core components |
| `@veloracss.io/css/transitions` | Transition styles |
| `@veloracss.io/css/premium` | Additional visual styles |
| `@veloracss.io/css/overrides` | Override layer |

Prefer the smallest entrypoint that fits your interface. The full bundle includes visual styles that may affect an existing design.

## Motion authorship

Velora uses declarative HTML attributes for effects, timelines and scenes, composed through CSS layers and `--vl-*` custom properties. Consult the [documentation](https://docs.veloracss.io/) for the current attribute grammar, scene authoring and progressive-enhancement behavior. The [Showcase](https://veloracss.io/) provides interactive examples.

## Compatibility and accessibility

Modern CSS features are progressive enhancements, not a promise of identical behavior in every browser. Test the features you use in your target browsers. Preserve semantic HTML, visible focus, readable content and the reduced-motion behavior supplied by the styles. CSS motion does not replace application accessibility testing.

“Zero animation runtime JavaScript” describes the animation engine. Applications may still use JavaScript for their own UI or business logic.

## Distribution and verification

This public repository contains reviewed CSS snapshots. Canonical development remains separate; no private development history is included here.

- `src/`: distributed CSS sources.
- `dist/`: matching CSS copies for direct asset consumption.
- `distribution-manifest.json`: version and SHA-256 checksums.
- `verify.mjs`: checks hashes, CSS imports and entrypoints.
- `consumer-test.mjs`: packs and installs the package in an isolated consumer.

With Node.js 24 and npm installed:

```sh
node verify.mjs
node --test .github/scripts/verify-release.test.mjs
node consumer-test.mjs
```

CI and signature checks cover specific regression and packaging risks; they are not a comprehensive security audit. Publication uses a protected GitHub environment and npm Trusted Publishing, with provenance enabled. Only claim a verified publication after the workflow and registry checks succeed.

## Feedback and security

Report reproducible bugs through [GitHub Issues](https://github.com/erikconnect/velora-distribution/issues). Include the package version, browser, entrypoint and a minimal example. Do not post credentials or sensitive security details in public issues; use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/privately-reporting-a-security-vulnerability) where available.

## License

[ISC](LICENSE) — Copyright (c) 2026 Erik. See the license for permissions and warranty limitations.
