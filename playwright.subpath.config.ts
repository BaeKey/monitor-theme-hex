import {defineConfig} from '@playwright/test'
const mounts=['','/monitor','/a/b','/%E7%9B%91%E6%8E%A7']
export default defineConfig({
 testDir:'./tests',testMatch:'subpath.spec.ts',fullyParallel:false,
 use:{channel:process.env.TEST_BROWSER==='chromium'?undefined:process.env.TEST_BROWSER||'chrome',reducedMotion:'reduce',viewport:{width:1440,height:1000}},
 projects:mounts.map((prefix,i)=>({name:prefix||'root',use:{baseURL:`http://127.0.0.1:${4180+i}${prefix}/`}})),
 webServer:mounts.map((prefix,i)=>({command:`THEME_DEMO_PORT=${4180+i} THEME_DEMO_BASE='${prefix}' THEME_DEMO_ADMIN=1 npm run demo`,url:`http://127.0.0.1:${4180+i}${prefix}/`,reuseExistingServer:false})),
})
