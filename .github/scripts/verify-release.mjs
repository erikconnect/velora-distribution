import { execFileSync } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function validateRelease({ repository, tag, version, event, ref }) {
  if (repository !== 'erikconnect/velora-distribution') throw new Error('Only erikconnect/velora-distribution can publish this package.');
  if (!/^css-v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag || '')) throw new Error('Expected a css-v semantic-version tag.');
  if (tag !== `css-v${version}`) throw new Error('Release tag must match packages/css/package.json.');
  if (!['push', 'workflow_dispatch'].includes(event)) throw new Error('Unsupported release event.');
  if (event === 'push' && ref !== `refs/tags/${tag}`) throw new Error('Push release must use the selected tag.');
  if (event === 'workflow_dispatch' && ref !== 'refs/heads/main') throw new Error('Manual release must run the workflow from main.');
}

export function validateProtection(branch, environment, policies) {
  if (branch.protected !== true) throw new Error('main must be protected before publishing (#55).');
  const review = environment.protection_rules?.find((rule) => rule.type === 'required_reviewers');
  if (!review?.reviewers?.length) {
    throw new Error('npm-release requires configured reviewers.');
  }
  if (environment.deployment_branch_policy?.custom_branch_policies !== true ||
      !policies.branch_policies?.some((policy) => policy.type === 'tag' && policy.name === 'css-v*') ||
      !policies.branch_policies.some((policy) => policy.type === 'branch' && policy.name === 'main') ||
      policies.branch_policies.some((policy) => !((policy.type === 'tag' && policy.name === 'css-v*') || (policy.type === 'branch' && policy.name === 'main')))) {
    throw new Error('npm-release must allow only css-v* tags and main for manual dispatch.');
  }
}

export async function verifyRelease(env = process.env, { cwd = process.cwd(), fetchImpl = fetch } = {}) {
  const tag = env.RELEASE_TAG;
  if (!/^css-v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag || '')) throw new Error('Expected a css-v semantic-version tag.');
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const { version } = JSON.parse(git('show', `${tag}:package.json`));
  validateRelease({ repository: env.GITHUB_REPOSITORY, tag, version, event: env.GITHUB_EVENT_NAME, ref: env.GITHUB_REF });
  const commit = git('rev-parse', `refs/tags/${tag}^{commit}`);
  if (env.RELEASE_COMMIT && env.RELEASE_COMMIT !== commit) throw new Error('Release tag changed after verification.');
  git('merge-base', '--is-ancestor', commit, 'origin/main');
  if (!env.GH_TOKEN) throw new Error('GitHub token is required to verify release protection.');
  async function api(path) {
    const response = await fetchImpl(`https://api.github.com/repos/erikconnect/velora-distribution/${path}`, {
      headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (!response.ok) throw new Error(`Release protection could not be verified: ${path} (${response.status}).`);
    return response.json();
  }
  const [branch, environment, policies, repository] = await Promise.all([
    api('branches/main'), api('environments/npm-release'), api('environments/npm-release/deployment-branch-policies'), api(''),
  ]);
  validateProtection(branch, environment, policies);
  if (repository.private !== false) throw new Error('npm provenance requires a public source repository; resolve the publication visibility decision (#49).');
  if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `commit=${commit}\n`);
  console.log(`Release identity, ancestry and protection verified for ${tag}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  verifyRelease().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
