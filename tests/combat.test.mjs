import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
// Tests on TS modules use Vite's TypeScript transpiler via esbuild, available as a Vite dependency.
import {transform} from 'esbuild';
const source=readFileSync(new URL('../src/combat.ts',import.meta.url),'utf8');const {code}=await transform(source,{loader:'ts',format:'esm'});const {mitigation,damage,createUnit,approach}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('mitigation applies armor formula',()=>assert.equal(mitigation(132,32),100));
test('shield absorbs before HP',()=>{const u=createUnit(1,'hero','blue',0,0,{maxHp:720,attack:65,defense:0,range:1,attackInterval:1});u.shield=150;damage(u,100);assert.equal(u.hp,720);assert.equal(u.shield,50);damage(u,100);assert.equal(u.hp,670);});
test('lethal damage marks unit dead',()=>{const u=createUnit(1,'minion','red',0,0,{maxHp:10,attack:1,defense:0,range:1,attackInterval:1});damage(u,100);assert.equal(u.alive,false);assert.equal(u.hp,0);});
test('movement respects unit speed',()=>{const u=createUnit(1,'hero','blue',0,0,{maxHp:10,attack:1,defense:0,range:1,attackInterval:1,speed:5});approach(u,10,0,.2);assert.equal(u.x,1);});
test('movement faces destination in every quadrant without overshooting',()=>{for(const [x,z] of [[4,0],[-4,0],[0,4],[0,-4],[3,3],[-3,3]]){const u=createUnit(2,'hero','blue',0,0,{maxHp:10,attack:1,defense:0,range:1,attackInterval:1,speed:5});approach(u,x,z,10);assert.ok(Math.abs(u.x-x)<1e-9);assert.ok(Math.abs(u.z-z)<1e-9);assert.ok(Math.abs(-Math.sin(u.facing)-x/Math.hypot(x,z))<1e-9);assert.ok(Math.abs(-Math.cos(u.facing)-z/Math.hypot(x,z))<1e-9);}});
