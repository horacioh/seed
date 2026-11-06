// Builds every editor exploration from its PR branch into `site/`, next to the index page.
// Usage: node frontend/apps/editor-explorations/build.mjs [slug...]
import {execFileSync} from 'node:child_process'
import {cpSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const site = path.join(here, 'site')
const work = path.join(here, '.worktrees')
const config = JSON.parse(readFileSync(path.join(here, 'explorations.json'), 'utf8'))
const only = process.argv.slice(2)
const entries = [...config.editors, ...config.extras].filter((e) => !only.length || only.includes(e.slug))

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, {cwd, stdio: ['ignore', 'pipe', 'inherit']})
    .toString()
    .trim()
const repo = run('git', ['rev-parse', '--show-toplevel'], here)

rmSync(site, {recursive: true, force: true})
mkdirSync(work, {recursive: true})
const builds = {}
for (const entry of entries) {
  const ref = `refs/explorations/${entry.slug}`
  const dir = path.join(work, entry.slug)
  console.log(`\n▶ ${entry.name} (${entry.branch})`)
  run('git', ['fetch', '--depth', '1', 'origin', `+refs/heads/${entry.branch}:${ref}`], repo)
  rmSync(dir, {recursive: true, force: true})
  run('git', ['worktree', 'prune'], repo)
  run('git', ['worktree', 'add', '--force', '--detach', dir, ref], repo)
  execFileSync('pnpm', ['install', '--frozen-lockfile', '--prefer-offline', '--filter', `./${entry.appDir}...`], {
    cwd: dir,
    stdio: 'inherit',
  })
  execFileSync(
    'pnpm',
    ['exec', 'vite', 'build', '--config', entry.viteConfig, '--base', './', '--outDir', path.join(site, entry.slug)],
    {cwd: path.join(dir, entry.appDir), stdio: 'inherit'},
  )
  builds[entry.slug] = {
    commit: run('git', ['rev-parse', 'HEAD'], dir),
    date: run('git', ['log', '-1', '--format=%cI'], dir),
  }
  run('git', ['worktree', 'remove', '--force', dir], repo)
}

cpSync(path.join(here, 'index.html'), path.join(site, 'index.html'))
writeFileSync(
  path.join(site, 'explorations.json'),
  JSON.stringify({...config, builds, builtAt: new Date().toISOString()}),
)
console.log(`\n✓ Built ${entries.length} explorations into ${path.relative(repo, site)}`)
