import {mkdirSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {EMAIL_PALETTE} from './email-palette'
import {createPreviews} from './render-all-previews'

async function main() {
  const outputDir = resolve(process.env.A11Y_EMAIL_OUTPUT_DIR ?? './email-previews')
  const previews = await createPreviews()
  mkdirSync(outputDir, {recursive: true})

  for (const {name, result} of previews) {
    writeFileSync(resolve(outputDir, `${name}.html`), result.html)
    console.log(`Subject: ${result.subject}`)
    console.log(`  -> ${outputDir}/${name}.html`)
  }

  const indexHtml = `<!DOCTYPE html>
<html><head><title>Email Previews</title>
<style>body{font-family:system-ui;max-width:600px;margin:40px auto;padding:0 20px}
a{display:block;padding:12px 0;font-size:18px;color:${
    EMAIL_PALETTE.brand
  };text-decoration:none;border-bottom:1px solid #eee}
a:hover{color:#045c50}</style></head>
<body><h1>Email Template Previews</h1>
${previews.map(({name}) => `<a href="${name}.html">${name}</a>`).join('\n')}
</body></html>`
  writeFileSync(resolve(outputDir, 'index.html'), indexHtml)
}

void main()
