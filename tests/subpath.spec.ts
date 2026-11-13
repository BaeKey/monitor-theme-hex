import {test,expect} from '@playwright/test'
import {nodes} from '../scripts/fixtures.mjs'

test('mounted assets, live API, detail history and admin navigation',async({page,baseURL})=>{
 const mount=new URL(baseURL!).pathname.replace(/\/$/,'')
 const requests:string[]=[],failed:string[]=[],sockets:string[]=[],errors:string[]=[]
 page.on('pageerror',e=>errors.push(e.message))
 page.on('request',r=>requests.push(r.url()))
 page.on('response',r=>{if(r.status()>=400)failed.push(r.url())})
 await page.addInitScript(()=>{
  localStorage.setItem('monitor-next',JSON.stringify({_storageVersion:1,modules:{map:false},backgroundUrl:'/background.svg'}))
 })
 await page.routeWebSocket('**/api/ws',socket=>{
  sockets.push(socket.url())
  socket.send(JSON.stringify({nodes:nodes()}))
 })
 await page.route('**/api/themes/hex/config',r=>r.fulfill({json:{module_map:false,backgroundUrl:'/background.svg'}}))
 await page.goto(baseURL!)
 await expect(page.locator('.node-card').first()).toBeVisible()
 await expect.poll(()=>sockets.length).toBeGreaterThan(0)
 expect(sockets.every(u=>new URL(u).pathname===mount+'/api/ws')).toBeTruthy()
 await expect.poll(()=>requests.some(u=>u.endsWith('.woff2'))).toBeTruthy()
 for(const path of ['/api/me','/api/themes/hex/config','/theme-config.json','/background.svg']) {
  await expect.poll(()=>requests.some(u=>new URL(u).pathname===mount+path),{message:path}).toBeTruthy()
 }
 // Static icons, installable PWA paths and dynamic map/detail chunks must not escape the mount.
 for(const path of ['/favicon.svg','/icons/hex-home-180.png','/assets/flags/US.svg','/assets/logo/linux.svg']) {
  const response=await page.request.get(baseURL!+path.slice(1));expect(response.ok()).toBeTruthy()
 }
 const manifest=await (await page.request.get(baseURL!+'site.webmanifest')).json()
 const manifestURL=new URL('site.webmanifest',baseURL)
 for(const value of [manifest.id,manifest.start_url,manifest.scope,...manifest.icons.map((i:{src:string})=>i.src)])expect(new URL(value,manifestURL).pathname.startsWith(mount+'/')).toBeTruthy()
 await expect(page.locator('a[href="'+mount+'/admin/"]').first()).toBeVisible()
 await page.locator('.node-card .node-open').first().click()
 await expect(page).toHaveURL(new RegExp(mount+'/node/'))
 await page.reload()
 await expect(page.locator('.node-detail')).toBeVisible()
 expect(new URL(page.url()).pathname).toContain(mount+'/node/')
 await page.goBack()
 await expect(page.locator('.node-card').first()).toBeVisible()
 await page.goForward()
 await expect(page.locator('.node-detail')).toBeVisible()
 // A direct deep link, including resource ranges and anchors, survives boot and refresh.
 await page.goto(baseURL!+'node/1?rh=6&lh=24#latency')
 await expect(page.locator('.node-detail')).toBeVisible()
 await expect(page).toHaveURL(/rh=6/)
 await page.setViewportSize({width:390,height:844})
 await page.goto(baseURL!+'?page=settings')
 await expect(page.locator('a[href="'+mount+'/admin/"]').first()).toBeVisible()
 expect(requests.filter(u=>new URL(u).origin===new URL(baseURL!).origin).every(u=>new URL(u).pathname.startsWith(mount+'/'))).toBeTruthy()
 expect(failed).toEqual([])
 expect(errors).toEqual([])
})
