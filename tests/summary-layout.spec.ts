import {test,expect} from './desktopTest'

const keys=['online','traffic','speed','busiest','regions','clock']
for(const language of ['zh','en'])for(const count of [1,2,3,4,5,6])test(`summary ${count} modules align consistently in ${language}`,async({page})=>{
 await page.addInitScript(lang=>localStorage.setItem('monitor-next-language',lang),language)
 await page.route('**/api/themes/hex/config',r=>r.fulfill({json:Object.fromEntries(keys.map((key,i)=>['module_'+key,i<count]))}))
 for(const width of [721,800,900,1101,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/')
  const tiles=page.locator('.summary-grid > div');await expect(tiles).toHaveCount(count)
  const geometry=await tiles.evaluateAll(items=>items.map(item=>{
   const box=item.getBoundingClientRect(),style=getComputedStyle(item)
   return {x:box.x,y:Math.round(box.y),right:box.right,width:box.width,left:style.paddingLeft,paddingRight:style.paddingRight,overflow:item.scrollWidth>item.clientWidth+1}
  }))
  const columns=width>=1200?6:width>=900&&count>=5?3:2
  expect(new Set(geometry.map(box=>box.y)).size).toBe(Math.ceil(count/columns))
  for(const box of geometry){expect(box.left).toBe(box.paddingRight);expect(box.overflow).toBe(false)}
  for(const y of new Set(geometry.map(box=>box.y))){
   const row=geometry.filter(box=>box.y===y)
   expect(Math.max(...row.map(box=>box.width))-Math.min(...row.map(box=>box.width))).toBeLessThanOrEqual(1)
   const grid=await page.locator('.summary-grid').boundingBox()
   expect(Math.abs(row.at(-1)!.right-(grid!.x+grid!.width))).toBeLessThanOrEqual(2)
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  if(count>=4){
   const button=page.locator('.summary-grid .load-history-button')
   await expect(button).toHaveCSS('position','static')
   await button.focus();await page.keyboard.press('Enter')
   await expect(page.locator('dialog[open]')).toBeVisible()
   await page.keyboard.press('Escape');await expect(button).toBeFocused()
  }
 }
})

test('summary node filters remain operable',async({page})=>{
 await page.goto('/')
 const online=page.getByRole('button',{name:'筛选在线节点',exact:true})
 await online.click();await expect(online).toHaveAttribute('aria-pressed','true')
 await page.getByRole('button',{name:'显示全部节点',exact:true}).click()
 await expect(online).toHaveAttribute('aria-pressed','false')
})
