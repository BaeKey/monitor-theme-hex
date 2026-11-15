import assert from 'node:assert/strict'
import {readRouteSelection,selectedRouteIds} from './routeSelection.ts'
assert.equal(readRouteSelection(null),'all')
for(const value of ['', 'auto', 'junk', '0,-1,9007199254740993'])assert.equal(readRouteSelection(value),'all')
assert.deepEqual(readRouteSelection('2,2,3,-1'),[2,3])
assert.deepEqual(selectedRouteIds(readRouteSelection(null),[1,2,3,4]),[1,2,3,4])
assert.deepEqual(selectedRouteIds(readRouteSelection('2'),[1,2,3]),[2])
assert.deepEqual(selectedRouteIds('all',[]),[])
console.log('Detail routes default to all; explicit, missing and legacy URL selections are isolated')
