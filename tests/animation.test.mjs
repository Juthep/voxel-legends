import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['src/renderer.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {WorldRenderer}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
function setup(){const world=Object.create(WorldRenderer.prototype);world.scene={add(){}};world.unitMeshes=new Map();world.effects=[];const u={id:1,kind:'hero',team:'blue',x:0,z:0,alive:true,facing:0,shield:0};world.createUnit(u);return {world,u,g:world.unitMeshes.get(1)};}
test('every attack restarts an arm swing and returns to ready',()=>{const {world,u,g}=setup();world.strike(u,{...u,id:2,z:-1});world.sync([u],.1);assert.notEqual(g.getObjectByName('rightArm').rotation.y,0);for(let i=0;i<40;i++)world.sync([u],1/60);assert.equal(g.userData.attack,0);assert.equal(g.getObjectByName('rightArm').rotation.y,0);world.strike(u,{...u,id:2,z:-1});assert.equal(g.userData.attack,.42);});
test('Q rotates body while ground marker stays level and finishes facing forward',()=>{const {world,u,g}=setup();world.animateSkill(u,'q');world.sync([u],.29);world.sync([u],.01);assert.ok(g.getObjectByName('body').rotation.y>2);assert.equal(g.rotation.x,0);for(let i=0;i<60;i++)world.sync([u],1/60);assert.equal(g.userData.spin,0);assert.equal(g.getObjectByName('body').rotation.y,0);});
test('dash leans forward and recovers after stopping',()=>{const {world,u,g}=setup();world.setDash(u,true);world.sync([u],.1);assert.ok(g.getObjectByName('body').rotation.x<-.4);world.setDash(u,false);for(let i=0;i<60;i++)world.sync([u],1/60);assert.ok(Math.abs(g.getObjectByName('body').rotation.x)<.001);});
