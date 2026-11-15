import {test,expect} from '@playwright/test'
for(const width of [1440,390]){
 test(`home has no probe reads, latency display or map at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000})
  const reads:string[]=[]
  page.on('request',r=>{if(/\/api\/nodes\/\d+\/metrics/.test(r.url()))reads.push(r.url())})
  await page.addInitScript(()=>{
   localStorage.setItem('monitor-next',JSON.stringify({probe:'2',homeRoutes:3,modules:{map:true}}))
   localStorage.setItem('monitor-next-table-columns-v1',JSON.stringify({columns:['cpu','latency','loss','probe'],columnsVersion:5}))
  })
  await page.goto('/')
  await expect(page.locator(width===390?'.ma-node':'.node-card').first()).toBeVisible()
  await expect(page.locator('.ping-stats,.route-matrix,.map-frame,.ma-network-link,.ma-network-placeholder')).toHaveCount(0)
  await page.waitForTimeout(5500)
  expect(reads).toEqual([])
  if(width===1440){
   await page.getByRole('button',{name:'表格视图',exact:true}).click()
   await expect(page.locator('th[data-column="cpu"]')).toBeVisible()
   await expect(page.locator('[data-column="latency"],[data-column="loss"],[data-column="probe"]')).toHaveCount(0)
  }else{
   await page.getByRole('button',{name:'概览',exact:true}).click()
   await expect(page.getByRole('button',{name:'查看地图'})).toHaveCount(0)
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
  await page.screenshot({path:`tests/artifacts/home-no-probes-${width}.png`,fullPage:true})
 })
 test(`detail starts with all routes and supports a specific route at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000})
  await page.route('**/api/nodes/*/metrics**',async route=>{
   const response=await route.fetch(),data=await response.json()
   data.probes={'1':'Route One','2':'Route Two','3':'Route Three','4':'Route Four'}
   const source=data.ping.filter((p:{task_id:number})=>p.task_id===1)
   data.ping=[1,2,3,4].flatMap(id=>source.map((p:object)=>({...p,task_id:id})))
   await route.fulfill({json:data})
  })
  await page.goto('/node/1#latency')
  const select=page.locator('[aria-label="查看线路"]')
  await expect(select).toContainText('显示全部线路')
  await expect(page.locator('.detail-latency-line')).toHaveCount(4)
  await select.click()
  await expect(page.getByText('跟随全局',{exact:false})).toHaveCount(0)
  const option=width===390?page.getByRole('dialog').getByRole('button',{name:'Route Two',exact:true}):page.getByRole('option',{name:'Route Two',exact:true})
  await option.click()
  await expect(select).toContainText('Route Two')
  await expect(page.locator('.detail-latency-line')).toHaveCount(1)
  await expect(page).toHaveURL(/routes=2/)
  await page.reload()
  await expect(select).toContainText('Route Two')
  await page.goto('/node/1#latency')
  await expect(select).toContainText('显示全部线路')
  await expect(page.locator('.detail-latency-line')).toHaveCount(4)
  await page.screenshot({path:`tests/artifacts/detail-all-routes-${width}.png`,fullPage:true})
 })
}
