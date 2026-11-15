import {test,expect} from '@playwright/test'
import {nodes,metrics} from '../scripts/fixtures.mjs'

for(const width of [1440,390])for(const mode of ['follow','custom']) {
 test(`disabled account fields stay hidden on cards, reminders and details: ${width}/${mode}`,async({page})=>{
  await page.setViewportSize({width,height:1000})
  const flags=Object.fromEntries(['traffic','connections','uptime','expiry','remarks','price'].map(key=>[(width===390&&mode==='custom'?'mobile_card_info_':'card_info_')+key,false]))
  await page.route('**/api/themes/hex/config',r=>r.fulfill({json:{...flags,mobileInfoMode:mode,module_map:false}}))
  await page.route('**/api/me',r=>r.fulfill({json:{authed:true,public_page:true,site_name:'HEX'}}))
  const data=nodes().slice(0,1).map(n=>({...n,remark:'PRIVATE-NOTE',price:99,expires_at:new Date(Date.now()+86400000).toISOString().slice(0,10),traffic_limit:1,month_rx:100,month_tx:100}))
  await page.route('**/api/nodes',r=>r.fulfill({json:{nodes:data}}))
  await page.route('**/api/nodes/*/metrics?*',r=>r.fulfill({json:metrics()}))
  await page.addInitScript(()=>localStorage.setItem('hex-desktop-v1',JSON.stringify({cardDensity:'detailed'})))
  await page.goto('/')
  await expect(page.locator(width===390?'.ma-node':'.node-card').first()).toBeVisible()
  await expect(page.locator('.node-price,.card-expiry,.card-expiry-tag')).toHaveCount(0)
  await expect(page.locator('.billing-reminder-trigger')).toHaveCount(0)
  if(width===390){
   await page.goto('/?page=overview')
   await expect(page.locator('.ma-reminder-shortcuts')).toHaveCount(0)
  }
  await page.goto('/node/'+data[0].id)
  await expect(page.locator('.node-detail')).toBeVisible()
  await expect(page.locator('.account-cost,.account-expiry,.account-traffic')).toHaveCount(0)
  await expect(page.locator('#detail-account')).toHaveCount(0)
  await expect(page.locator('.detail-status-band').filter({hasText:'TCP'})).toHaveCount(0)
  await expect(page.locator('.detail-status-band').filter({hasText:'在线时长'})).toHaveCount(0)
  await expect(page.locator('.node-detail')).not.toContainText('PRIVATE-NOTE')
 })
}

test('table preferences cannot override disabled theme fields',async({page})=>{
 await page.route('**/api/themes/hex/config',r=>r.fulfill({json:{card_info_price:false,card_info_expiry:false,card_info_traffic:false,card_info_remarks:false,card_info_connections:false,card_info_uptime:false,module_map:false}}))
 await page.route('**/api/me',r=>r.fulfill({json:{authed:true,public_page:true}}))
 await page.route('**/api/nodes',r=>r.fulfill({json:{nodes:nodes()}}))
 await page.addInitScript(()=>{
  sessionStorage.setItem('monitor-next-browse-v1',JSON.stringify({view:'table'}))
  localStorage.setItem('monitor-next-table-columns-v1',JSON.stringify({columnsVersion:5,columns:['billing','expiry','traffic','todayTraffic','remark','connections','uptime','cpu']}))
 })
 await page.goto('/')
 await expect(page.locator('.node-table')).toBeVisible()
 for(const key of ['billing','expiry','traffic','todayTraffic','remark','connections','uptime'])await expect(page.locator(`td[data-column="${key}"]`)).toHaveCount(0)
 await expect(page.locator('td[data-column="cpu"]').first()).toBeVisible()
})

test('enabled expiry and authenticated cost remain available in details',async({page})=>{
 await page.route('**/api/themes/hex/config',r=>r.fulfill({json:{card_info_price:true,card_info_expiry:true,module_map:false}}))
 await page.route('**/api/me',r=>r.fulfill({json:{authed:true,public_page:true}}))
 await page.route('**/api/nodes',r=>r.fulfill({json:{nodes:nodes()}}))
 await page.route('**/api/nodes/*/metrics?*',r=>r.fulfill({json:metrics()}))
 await page.goto('/node/1')
 await expect(page.locator('.account-cost')).toBeVisible()
 await expect(page.locator('.account-expiry')).toBeVisible()
})

for(const hidden of ['price','expiry','traffic'])test(`one disabled field does not hide its enabled neighbours: ${hidden}`,async({page})=>{
 await page.route('**/api/themes/hex/config',r=>r.fulfill({json:{['card_info_'+hidden]:false,module_map:false}}))
 await page.route('**/api/me',r=>r.fulfill({json:{authed:true,public_page:true}}))
 await page.route('**/api/nodes',r=>r.fulfill({json:{nodes:nodes()}}))
 await page.route('**/api/nodes/*/metrics?*',r=>r.fulfill({json:metrics()}))
 await page.goto('/node/1')
 await expect(page.locator('.node-detail')).toBeVisible()
 for(const [key,selector] of [['price','.account-cost'],['expiry','.account-expiry'],['traffic','.account-traffic']]) {
  if(key===hidden)await expect(page.locator(selector)).toHaveCount(0)
  else await expect(page.locator(selector)).toBeVisible()
 }
})

test('anonymous visitors never see costs even when theme price is enabled',async({page})=>{
 await page.route('**/api/themes/hex/config',r=>r.fulfill({json:{card_info_price:true,module_map:false}}))
 await page.route('**/api/me',r=>r.fulfill({json:{authed:false,public_page:true}}))
 await page.route('**/api/nodes',r=>r.fulfill({json:{nodes:nodes()}}))
 await page.route('**/api/nodes/*/metrics?*',r=>r.fulfill({json:metrics()}))
 await page.goto('/node/1')
 await expect(page.locator('.node-detail')).toBeVisible()
 await expect(page.locator('.account-cost')).toHaveCount(0)
 await expect(page.locator('.account-expiry')).toBeVisible()
})
