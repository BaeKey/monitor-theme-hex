import assert from 'node:assert/strict'
import { browseNodes, defaultBrowse, normalizeBrowse, tableColumns, tablePreset } from './browse.ts'
import type { Node } from './api.ts'
const create = (id: number, cpu: number | null): Node => ({ id, sort: id, name: `Node ${id}`, country: 'JP', os: 'Debian', arch: 'x86', online: cpu !== null, metrics: cpu === null ? null : { cpu }, expires_at: id === 1 ? '2027-01-01' : null } as Node)
const nodes = [create(3, null), create(2, 20), create(1, 80)]
assert.deepEqual(browseNodes(nodes, defaultBrowse).map(n => n.id), [1,2,3])
assert.deepEqual(browseNodes(nodes, { ...defaultBrowse, sort: 'cpu', direction: 'asc' }).map(n => n.id), [2,1,3])
assert.deepEqual(browseNodes(nodes, { ...defaultBrowse, sort: 'cpu', direction: 'desc' }).map(n => n.id), [1,2,3])
assert.equal(browseNodes(nodes, { ...defaultBrowse, query: '日本' }).length, 3)
assert.deepEqual(browseNodes(nodes, { ...defaultBrowse, sort: 'expiry', direction: 'desc' }).map(n => n.id), [1,2,3])
assert.deepEqual(browseNodes([create(2,20),create(1,20)], { ...defaultBrowse, sort:'cpu' }).map(n=>n.id), [1,2])
const {setLanguage}=await import('./i18n.ts')
const localeNodes=[{...create(1,20),name:'Aster'},{...create(2,20),name:'阿尔法'}]
setLanguage('en')
assert.deepEqual(browseNodes(localeNodes,{...defaultBrowse,sort:'name'}).map(n=>n.id),[1,2])
setLanguage('zh')
assert.deepEqual(browseNodes(localeNodes,{...defaultBrowse,sort:'name'}).map(n=>n.id),[2,1])
console.log('sorting, null-last, default order, ties and region search passed')

assert.deepEqual(tableColumns(defaultBrowse.columns,true,false),['name','cpu','memory','disk','speed','traffic','expiry'])
assert.deepEqual(tableColumns(['download'],true,true),['name','speed'])
assert.deepEqual(tableColumns([],false,false),['name','status'])
assert.equal(normalizeBrowse({}).tableLayout,'grouped')
for(const version of [2,3,4]) {
 const old=normalizeBrowse({columnsVersion:version,columns:['cpu','upload'],mobileColumns:[]})
 assert.deepEqual(old.columns,['cpu','upload']);assert.deepEqual(old.mobileColumns,[])
 assert.equal(old.tableLayout,'separate');assert.equal(old.mobileTableLayout,'separate')
}
assert.deepEqual(normalizeBrowse({columns:['cpu']}).columns,['cpu','traffic'])
assert.deepEqual(normalizeBrowse({columnsVersion:3,columns:['download','alien']}).columns,['download'])
assert.equal(normalizeBrowse({columns:[],tableLayout:'grouped'}).tableLayout,'grouped')
assert.deepEqual(tablePreset('network',true),{mobileColumns:['upload','download'],mobileTableLayout:'grouped'})
assert.deepEqual(Object.keys(tablePreset('billing',false)),['columns','tableLayout'])
assert.equal(normalizeBrowse(null).columnsVersion,5)
// Retired quality columns and saved sorts cannot reappear through old settings.
const old=normalizeBrowse({sort:'latency',probe:'2',columnsVersion:5,columns:['cpu','latency','loss','probe'],mobileColumns:['cpu','latency']})
assert.equal(old.sort,'default')
assert.deepEqual(old.columns,['cpu'])
assert.deepEqual(old.mobileColumns,['cpu'])
assert.equal(Object.hasOwn(old,'probe'),false)
