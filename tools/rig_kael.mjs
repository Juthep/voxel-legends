import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
const data=JSON.parse(fs.readFileSync('/tmp/kael-sculpt.json','utf8'));
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(r=>{this.result=r;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(r=>{this.result='data:'+blob.type+';base64,'+Buffer.from(r).toString('base64');this.onloadend?.();});}};
const body=new T.Group();body.name='body';
const definitions=[['spine',null,[0,0,0]],['head','spine',[0,2.78,0]],['leftArm','spine',[-.54,2.58,0]],['leftForearm','leftArm',[-.16,-.45,0]],['leftHand','leftForearm',[-.1,-.48,0]],['rightArm','spine',[.54,2.58,0]],['rightForearm','rightArm',[.16,-.45,0]],['rightHand','rightForearm',[.1,-.48,0]],['leftLeg','spine',[-.21,1.58,0]],['leftShin','leftLeg',[-.04,-.62,0]],['rightLeg','spine',[.21,1.58,0]],['rightShin','rightLeg',[.04,-.62,0]]];
const bones=[],byName={};for(const [name,parent,pos] of definitions){const b=new T.Bone();b.name=name;b.position.fromArray(pos);(parent?byName[parent]:body).add(b);bones.push(b);byName[name]=b;}
body.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();const ids=Object.fromEntries(bones.map((b,i)=>[b.name,i]));
const clamp=T.MathUtils.clamp,smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
function weights(binding,x,y,z){
 if(binding==='head')return [[ids.head,1]];
 if(binding==='body')return [[ids.spine,1]];
 if(binding==='skin'){
  if(y>2.75)return [[ids.head,smooth(2.75,2.9,y)],[ids.spine,1-smooth(2.75,2.9,y)]];
  if(Math.abs(x)>.37&&y>1.4){const side=x>0?'right':'left',arm=smooth(.35,.5,Math.abs(x)),lower=1-smooth(2.04,2.24,y);return [[ids[side+'Arm'],arm*(1-lower)],[ids[side+'Forearm'],arm*lower],[ids.spine,1-arm]];}
  if(y<1.66){const side=x>0?'right':'left',leg=1-smooth(1.43,1.67,y),shin=1-smooth(.84,1.06,y);return [[ids[side+'Leg'],leg*(1-shin)],[ids[side+'Shin'],leg*shin],[ids.spine,1-leg]];}
  return [[ids.spine,1]];
 }
 if(binding==='leftLeg'||binding==='rightLeg'){const shin=1-smooth(.84,1.06,y);return [[ids[binding],1-shin],[ids[binding.replace('Leg','Shin')],shin]];}
 return [[ids[binding]??0,1]];
}
const materials=Object.fromEntries(Object.entries(data.materials).map(([name,m])=>[name,new T.MeshStandardMaterial({name,color:new T.Color(...m.color),metalness:m.metalness,roughness:m.roughness,emissive:m.emission?new T.Color(...m.color):new T.Color(0),emissiveIntensity:m.emission})]));
const cape=new T.Group();cape.name='cape';cape.position.set(0,2.58,.19);body.add(cape);
const weapon=new T.Group();weapon.name='weapon';byName.rightHand.add(weapon);
const batches=new Map();
for(const part of data.meshes){const type=part.binding==='weapon'?'weapon':part.binding==='cape'?'cape':'skin';const key=type+':'+part.material;if(!batches.has(key))batches.set(key,{type,material:part.material,positions:[],indices:[],skinIndex:[],skinWeight:[]});const batch=batches.get(key);const offset=batch.positions.length/3;
 for(let i=0;i<part.positions.length;i+=3){let [x,y,z]=part.positions.slice(i,i+3);const ws=weights(part.binding,x,y,z);if(type==='weapon'){x-=.8;y-=1.65;}if(type==='cape'){y-=2.58;z-=.19;}batch.positions.push(x,y,z);const wi=ws.map(w=>w[0]),ww=ws.map(w=>w[1]);while(wi.length<4){wi.push(0);ww.push(0);}batch.skinIndex.push(...wi);batch.skinWeight.push(...ww);}
 batch.indices.push(...part.indices.map(i=>i+offset));}
for(const b of batches.values()){
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.positions,3));geo.setIndex(b.indices);geo.computeVertexNormals();
 let model;
 if(b.type==='skin'){geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(b.skinIndex,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(b.skinWeight,4));model=new T.SkinnedMesh(geo,materials[b.material]);body.add(model);model.bind(skeleton);}
 else{model=new T.Mesh(geo,materials[b.material]);(b.type==='weapon'?weapon:cape).add(model);}
 model.name=b.type+'-'+b.material;model.castShadow=true;model.receiveShadow=true;
}
const tip=new T.Object3D();tip.name='bladeTip';tip.position.z=-2.32;weapon.add(tip);const root=new T.Object3D();root.name='bladeRoot';root.position.z=-.42;weapon.add(root);
const fire=new T.MeshBasicMaterial({color:0xffb447,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending});
for(let i=0;i<9;i++){const mesh=new T.Mesh(new T.ConeGeometry(.04,.2,5),fire);mesh.name='bladeFlame';mesh.position.set(i%2?.14:-.14,.04,-.5-i*.18);weapon.add(mesh);}
body.updateMatrixWorld(true);
await new Promise((resolve,reject)=>new GLTFExporter().parse(body,result=>{fs.writeFileSync('public/models/kael-sculpt-v1.glb',Buffer.from(result));resolve();},reject,{binary:true}));
fs.writeFileSync('public/models/kael-sculpt-v1.glb.gz',gzipSync(fs.readFileSync('public/models/kael-sculpt-v1.glb'),{level:9}));
console.log('Skinned GLB bytes:',fs.statSync('public/models/kael-sculpt-v1.glb').size);
