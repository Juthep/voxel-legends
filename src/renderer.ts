import * as THREE from 'three';
import type {Unit} from './combat';
import {MAP} from './data';
export class WorldRenderer{
 scene=new THREE.Scene(); renderer:THREE.WebGLRenderer; unitMeshes=new Map<number,THREE.Group>(); ground:THREE.Mesh; effects:{mesh:THREE.Object3D;ttl:number;max:number}[]=[];
 constructor(host:HTMLElement){this.scene.background=new THREE.Color('#101923');this.scene.fog=new THREE.Fog('#101923',42,95);this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(this.renderer.domElement);this.scene.add(new THREE.HemisphereLight(0xa9d9ff,0x2b241c,2.3));const sun=new THREE.DirectionalLight(0xffd8a0,3);sun.position.set(-13,25,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;this.scene.add(sun);
 const grass=new THREE.Mesh(new THREE.BoxGeometry(MAP.width,1,MAP.height),new THREE.MeshStandardMaterial({color:0x294b42,roughness:1}));grass.position.y=-.55;grass.receiveShadow=true;this.scene.add(grass);this.ground=grass;
 const tile=(x:number,z:number,w:number,d:number,color:number,y=-.015)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.12,d),new THREE.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);m.receiveShadow=true;this.scene.add(m);return m;};
 tile(0,0,60,7,0x5d615a);for(let x=-29;x<30;x+=2.4){tile(x,0,2.1,5.6,Math.floor(x)%2===0?0x77756a:0x6b6e66,.055);}for(let x=-30;x<=30;x+=3){tile(x,4.1,2.4,.4,0x354f3e);tile(x,-4.1,2.4,.4,0x354f3e);}
 for(let i=0;i<125;i++){const x=(Math.sin(i*78.233)*43758.5453%1)*29,z=(Math.sin(i*29.114)*12593.47%1)*16;if(Math.abs(z)<5||Math.abs(x)>28)continue;const h=.3+(i%4)*.18;const b=new THREE.Mesh(new THREE.BoxGeometry(.45,h,.45),new THREE.MeshStandardMaterial({color:i%3===0?0x487e5b:0x365e4b}));b.position.set(x,h/2,z);this.scene.add(b);}
 this.base(-25,0x3385e9);this.base(23,0xc3443c);for(let z of [-11,11])for(let x of [-20,-9,7,17]){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1.1,0),new THREE.MeshStandardMaterial({color:0x52625e,flatShading:true}));rock.position.set(x,.3,z);rock.scale.set(1,.7,1);this.scene.add(rock);}
 }
 base(x:number,color:number){const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25,metalness:.25});for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(3.6-i*.7,.5,3.6-i*.7),new THREE.MeshStandardMaterial({color:i%2?0x263744:0x465463}));b.position.y=.15+i*.42;g.add(b);}const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.95),mat);crystal.position.y=2.3;g.add(crystal);g.position.x=x;this.scene.add(g);}
 createUnit(u:Unit){const g=new THREE.Group();g.position.set(u.x,0,u.z);const blue=u.team==='blue';const primary=new THREE.MeshStandardMaterial({color:u.kind==='hero'?0xc34a2c:blue?0x348cdd:0xc84650,roughness:.7});const dark=new THREE.MeshStandardMaterial({color:u.kind==='hero'?0x3d292b:blue?0x1d4169:0x652d35});const gold=new THREE.MeshStandardMaterial({color:0xffba57,emissive:0xc35b1b,emissiveIntensity:.6});const cube=(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
 if(u.kind==='tower'){cube(2.5,1.2,2.5,0,.6,0,dark);cube(1.65,3.5,1.65,0,2.6,0,primary);cube(2.5,.7,2.5,0,4.6,0,dark);for(const dx of [-.9,.9])for(const dz of [-.9,.9])cube(.6,.8,.6,dx,5.2,dz,primary);cube(.8,1.1,.8,0,5.5,0,gold); }else{
 const hero=u.kind==='hero',s=hero?1:.65;
 const skin=new THREE.MeshStandardMaterial({color:0xe6ad80,roughness:1});
 const hair=new THREE.MeshStandardMaterial({color:0x292136,roughness:1});
 const steel=new THREE.MeshStandardMaterial({color:0xafdbe4,metalness:.65,roughness:.3});
 const cloth=new THREE.MeshStandardMaterial({color:hero?0x176b80:blue?0x287dd0:0xb33147});
 cube(.88*s,.92*s,.54*s,0,1.35*s,0,cloth);
 cube(.96*s,.19*s,.59*s,0,.91*s,0,dark);
 cube(.19*s,.2*s,.08*s,0,.94*s,-.34*s,gold);
 cube(.67*s,.66*s,.62*s,0,2.16*s,0,skin);
 cube(.75*s,.22*s,.69*s,0,2.56*s,.02*s,hair);
 cube(.72*s,.32*s,.2*s,0,2.35*s,.28*s,hair);
 cube(.22*s,.3*s,.18*s,-.29*s,2.4*s,-.27*s,hair);
 for(const x of [-.17,.17]){cube(.15*s,.11*s,.04*s,x*s,2.21*s,-.33*s,steel);cube(.06*s,.09*s,.045*s,x*s,2.2*s,-.36*s,dark);}
 cube(.17*s,.055*s,.05*s,0,1.99*s,-.33*s,dark);
 if(hero){cube(.55,.24,.72,-.57,1.77,0,steel);cube(.43,.18,.65,.57,1.75,0,gold);cube(.72,.75,.13,0,1.3,.36,dark);cube(.85,.14,.17,0,1.65,-.35,gold);}
 const limb=(name:string,x:number,y:number,w:number,h:number,mat:THREE.Material)=>{const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x*s,y*s,0);g.add(pivot);const m=new THREE.Mesh(new THREE.BoxGeometry(w*s,h*s,.36*s),mat);m.position.y=-h*s/2;m.castShadow=true;pivot.add(m);return pivot;};
 limb('leftLeg',-.24,.87,.32,.78,dark);limb('rightLeg',.24,.87,.32,.78,dark);
 limb('leftArm',-.61,1.7,.3,.83,cloth);const arm=limb('rightArm',.61,1.7,.3,.83,cloth);
 const sword=new THREE.Mesh(new THREE.BoxGeometry(.18*s,1.25*s,.12*s),steel);sword.position.set(.1*s,-.5*s,-.47*s);sword.rotation.x=Math.PI/2;arm.add(sword);
 const guard=new THREE.Mesh(new THREE.BoxGeometry(.5*s,.12*s,.2*s),gold);guard.position.set(.1*s,-.5*s,-.24*s);arm.add(guard);
 g.userData.phase=0;g.userData.attack=0;g.userData.lastTimer=0;
 }

 const ring=new THREE.Mesh(new THREE.RingGeometry(u.kind==='tower'?1.6:heroRadius(u),u.kind==='tower'?1.75:heroRadius(u)+.12,32),new THREE.MeshBasicMaterial({color:blue?0x63b8ff:0xff6868,side:THREE.DoubleSide,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;ring.position.y=.09;g.add(ring);this.scene.add(g);this.unitMeshes.set(u.id,g);}
 sync(units:Unit[],dt:number){for(const u of units){let g=this.unitMeshes.get(u.id);if(!g){this.createUnit(u);g=this.unitMeshes.get(u.id)!;}g.visible=u.alive;const moved=Math.hypot(u.x-g.position.x,u.z-g.position.z);g.position.set(u.x,0,u.z);
 if(u.kind!=='tower'){
 g.rotation.y=u.facing;
 g.userData.phase+=moved*7;
 if(u.attackTimer>g.userData.lastTimer+.01)g.userData.attack=.32;
 g.userData.lastTimer=u.attackTimer;g.userData.attack=Math.max(0,g.userData.attack-dt);
 const swing=moved>.0001?Math.sin(g.userData.phase)*.65:0;
 for(const [name,angle] of [['leftLeg',swing],['rightLeg',-swing],['leftArm',-swing],['rightArm',swing]] as [string,number][]){const limb=g.getObjectByName(name);if(limb)limb.rotation.x=angle;}
 const arm=g.getObjectByName('rightArm');if(arm&&g.userData.attack>0){arm.rotation.x=-1.1-Math.sin(g.userData.attack/.32*Math.PI)*1.1;arm.rotation.z=-Math.sin(g.userData.attack/.32*Math.PI)*.7; }else if(arm)arm.rotation.z=0;
 }
 if(u.kind==='hero'){const glow=g.getObjectByName('shield');if(u.shield>0&&!glow){const sh=new THREE.Mesh(new THREE.SphereGeometry(1.8,12,8),new THREE.MeshBasicMaterial({color:0xffa438,wireframe:true,transparent:true,opacity:.32}));sh.position.y=1.3;sh.name='shield';g.add(sh);}else if(u.shield<=0&&glow)g.remove(glow);}}}
 slash(x:number,z:number,angle:number,color=0xffce75,r=1.7){
 const mesh=new THREE.Mesh(new THREE.RingGeometry(r*.7,r,24,1,-.95,1.9),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:1}));
 mesh.rotation.x=-Math.PI/2;mesh.rotation.z=angle+Math.PI/2;mesh.position.set(x,.85,z);this.scene.add(mesh);this.effects.push({mesh,ttl:.22,max:.22});
 }
 strike(from:Unit,to:Unit){from.facing=Math.atan2(from.x-to.x,from.z-to.z);this.slash(from.x,from.z,from.facing,from.team==='blue'?0x91edff:0xff7c74,from.kind==='hero'?1.8:1.2);this.burst(to.x,to.z,0xffdba0,.65,.18);}
 burst(x:number,z:number,color:number,r=1.3,ttl=.35){const mesh=new THREE.Mesh(new THREE.RingGeometry(r*.5,r,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.85}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.25,z);this.scene.add(mesh);this.effects.push({mesh,ttl,max:ttl});}
 tick(dt:number){this.effects=this.effects.filter(e=>{e.ttl-=dt;const material=(e.mesh as THREE.Mesh).material;if(material instanceof THREE.MeshBasicMaterial){material.opacity=Math.max(0,e.ttl/e.max);}e.mesh.scale.multiplyScalar(1+dt*1.8);if(e.ttl<=0){this.scene.remove(e.mesh);const m=e.mesh as THREE.Mesh;m.geometry?.dispose();if(m.material instanceof THREE.Material)m.material.dispose();return false;}return true;});}
 resize(w:number,h:number){this.renderer.setSize(w,h,false);}render(camera:THREE.Camera){this.renderer.render(this.scene,camera);}
}
function heroRadius(u:Unit){return u.kind==='hero'?.8:.48;}
