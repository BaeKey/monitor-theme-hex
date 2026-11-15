import {test,expect} from '@playwright/test'
import {nodes} from '../scripts/fixtures.mjs'

for(const authed of [false,true])for(const width of [320,390])test(`mobile settings never check versions (authed=${authed}, width=${width})`,async({page})=>{
 await page.setViewportSize({width,height:844})
 const versionRequests:string[]=[]
 page.on('request',r=>{if(new URL(r.url()).pathname.endsWith('/api/version'))versionRequests.push(r.url())})
 await page.route('**/api/me',r=>r.fulfill({json:{authed,github:false,site_name:'Test',public_page:true}}))
 await page.route('**/api/nodes',r=>r.fulfill({json:{nodes:nodes().slice(0,3)}}))
 await page.goto('/')
 await page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:'设置',exact:true}).click()
 await expect(page.locator('.ma-app-info')).toContainText('HEX')
 await expect(page.getByRole('button',{name:/版本与更新|检查更新/})).toHaveCount(0)
 await expect(page.locator('a[href$="/admin/update"],.ma-update-dot')).toHaveCount(0)
 await page.getByLabel('Language / 语言').selectOption('en')
 await expect(page.getByRole('button',{name:/Versions & updates|Check for updates/})).toHaveCount(0)
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Nodes',exact:true}).click()
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Settings',exact:true}).click()
 await expect(page.locator('.ma-app-info')).toBeVisible()
 expect(versionRequests).toEqual([])
})
