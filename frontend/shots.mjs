/* Скриншоты страниц CRM для визуальной проверки (запуск: node shots.mjs) */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const OUT = 'C:/Users/Voimax/AppData/Local/Temp/opencode/shots'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' })
await page.screenshot({ path: `${OUT}/01-login.png` })

await page.type('#login-username', 'Voimax')
await page.type('#login-password', 'ServiceCRM')
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
  page.click('button[type="submit"]'),
])
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: `${OUT}/02-dashboard.png` })

await page.goto('http://localhost:3000/requests', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))
await page.screenshot({ path: `${OUT}/03-requests.png` })

const firstRow = await page.$('table.requests tbody tr[data-clickable]')
if (firstRow) {
  await firstRow.click()
  await new Promise((r) => setTimeout(r, 1200))
  await page.screenshot({ path: `${OUT}/04-request-card.png` })
}

await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1200))
await page.screenshot({ path: `${OUT}/05-analytics.png` })

// мобильный вид
await page.setViewport({ width: 390, height: 844 })
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1000))
await page.screenshot({ path: `${OUT}/06-mobile-dashboard.png` })

await page.goto('http://localhost:3000/requests', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1000))
await page.screenshot({ path: `${OUT}/07-mobile-requests.png` })

await browser.close()
console.log('done')
