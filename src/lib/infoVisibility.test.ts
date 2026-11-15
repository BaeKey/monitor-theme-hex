import assert from 'node:assert/strict'
import {defaults} from './appearance.ts'
import {cardInfoFor,visibleInfoColumns} from './infoVisibility.ts'
import {applySiteConfig} from './siteConfig.ts'
const hidden=applySiteConfig({card_info_price:false,card_info_expiry:false,card_info_remarks:false},defaults)
assert.equal(cardInfoFor(hidden,false).price,false)
assert.equal(cardInfoFor(hidden,true).expiry,false)
const custom=applySiteConfig({mobileInfoMode:'custom',mobile_card_info_price:true,mobile_card_info_expiry:true},hidden)
assert.equal(cardInfoFor(custom,true).price,true)
assert.equal(cardInfoFor(custom,false).price,false)
assert.deepEqual(visibleInfoColumns(['billing','expiry','remark','cpu'],hidden.cardInfo,true),['cpu'])
assert.deepEqual(visibleInfoColumns(['billing','expiry','cpu'],defaults.cardInfo,false),['expiry','cpu'])
console.log('Shared field visibility, mobile overrides and table restrictions passed')
