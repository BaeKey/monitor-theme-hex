import assert from 'node:assert/strict'
import {basePath, currentBase, withBase, stripBase, socketURL, backgroundURL} from './base.ts'
import {api} from './api.ts'
import {homePath} from './navigation.ts'

for(const prefix of ['', '/monitor', '/a/b', '/%E7%9B%91%E6%8E%A7']) {
 const uri=`https://example.com${prefix}/`
 Object.assign(globalThis, {
  document:{baseURI:uri, querySelector:()=>({})},
  location:{origin:'https://example.com',pathname:`${prefix}/node/42`,href:`${uri}node/42?rh=6#latency`},
 })
 assert.equal(basePath(uri),prefix)
 assert.equal(currentBase(),prefix)
 assert.equal(withBase('/api/me'),`${prefix}/api/me`)
 assert.equal(stripBase(`${prefix}/node/42`),'/node/42')
 assert.equal(stripBase('/monitoring/node/42','/monitor'),'/monitoring/node/42')
 assert.equal(homePath('overview'),`${prefix}/?page=overview`)
 assert.equal(socketURL(),`wss://example.com${prefix}/api/ws`)
 assert.equal(backgroundURL('/background.svg'),`${prefix}/background.svg`)
 assert.equal(backgroundURL('/images/custom.jpg'),'/images/custom.jpg')
 assert.equal(backgroundURL('https://images.example.com/a.jpg'),'https://images.example.com/a.jpg')
 let requested=''
 Object.assign(globalThis,{fetch:async(url:string)=>{requested=url;return Response.json({authed:false})}})
 await api('/me')
 assert.equal(requested,`${prefix}/api/me`)
}
Object.assign(globalThis,{
 document:{baseURI:'http://localhost:5173/node/42',querySelector:()=>null},
 location:{origin:'http://localhost:5173'},
})
assert.equal(currentBase(),'')
assert.equal(socketURL(),'ws://localhost:5173/api/ws')
assert.equal(withBase('/admin/'),'/admin/')
console.log('Root, nested/encoded mount, deep-route, API, navigation and WebSocket URL checks passed')
