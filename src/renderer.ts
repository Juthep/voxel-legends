import * as THREE from 'three';
import type {Unit} from './combat';
import {MAP} from './data';
import {createKael} from './hero-model';
export class WorldRenderer{
 scene=new THREE.Scene(); renderer:THREE.WebGLRenderer; unitMeshes=new Map<number,THREE.Group>(); ground:THREE.Mesh; effects:{mesh:THREE.Object3D;ttl:number;max:number;fixed?:boolean}[]=[];
 fireParticles:{mesh:THREE.Mesh;life:number;max:number;velocity:THREE.Vector3}[]=[];
 fireGeometry=new THREE.OctahedronGeometry(1,0);
 constructor(host:HTMLElement){this.scene.background=new THREE.Color('#101923');this.scene.fog=new THREE.Fog('#101923',42,95);this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(this.renderer.domElement);this.scene.add(new THREE.HemisphereLight(0xa9d9ff,0x2b241c,2.3));const sun=new THREE.DirectionalLight(0xffd8a0,3);sun.position.set(-13,25,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;this.scene.add(sun);
 const grass=new THREE.Mesh(new THREE.BoxGeometry(MAP.width,1,MAP.height),new THREE.MeshStandardMaterial({color:0x294b42,roughness:1}));grass.position.y=-.55;grass.receiveShadow=true;this.scene.add(grass);this.ground=grass;
 const tile=(x:number,z:number,w:number,d:number,color:number,y=-.015)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.12,d),new THREE.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);m.receiveShadow=true;this.scene.add(m);return m;};
 tile(0,0,60,7,0x5d615a);for(let x=-29;x<30;x+=2.4){tile(x,0,2.1,5.6,Math.floor(x)%2===0?0x77756a:0x6b6e66,.055);}for(let x=-30;x<=30;x+=3){tile(x,4.1,2.4,.4,0x354f3e);tile(x,-4.1,2.4,.4,0x354f3e);}
 for(let i=0;i<125;i++){const x=(Math.sin(i*78.233)*43758.5453%1)*29,z=(Math.sin(i*29.114)*12593.47%1)*16;if(Math.abs(z)<5||Math.abs(x)>28)continue;const h=.3+(i%4)*.18;const b=new THREE.Mesh(new THREE.BoxGeometry(.45,h,.45),new THREE.MeshStandardMaterial({color:i%3===0?0x487e5b:0x365e4b}));b.position.set(x,h/2,z);this.scene.add(b);}
 this.base(-25,0x3385e9);this.base(23,0xc3443c);for(let z of [-11,11])for(let x of [-20,-9,7,17]){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1.1,0),new THREE.MeshStandardMaterial({color:0x52625e,flatShading:true}));rock.position.set(x,.3,z);rock.scale.set(1,.7,1);this.scene.add(rock);}
 }
 base(x:number,color:number){const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25,metalness:.25});for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(3.6-i*.7,.5,3.6-i*.7),new THREE.MeshStandardMaterial({color:i%2?0x263744:0x465463}));b.position.y=.15+i*.42;g.add(b);}const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.95),mat);crystal.position.y=2.3;g.add(crystal);g.position.x=x;this.scene.add(g);}
 createUnit(u:Unit){const g=new THREE.Group();g.position.set(u.x,0,u.z);const blue=u.team==='blue';const primary=new THREE.MeshStandardMaterial({color:u.kind==='hero'?0xc34a2c:blue?0x348cdd:0xc84650,roughness:.7});const dark=new THREE.MeshStandardMaterial({color:u.kind==='hero'?0x3d292b:blue?0x1d4169:0x652d35});const gold=new THREE.MeshStandardMaterial({color:0xffba57,emissive:0xc35b1b,emissiveIntensity:.6});const cube=(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
 if(u.kind==='tower'){cube(2.5,1.2,2.5,0,.6,0,dark);cube(1.65,3.5,1.65,0,2.6,0,primary);cube(2.5,.7,2.5,0,4.6,0,dark);for(const dx of [-.9,.9])for(const dz of [-.9,.9])cube(.6,.8,.6,dx,5.2,dz,primary);cube(.8,1.1,.8,0,5.5,0,gold); }else if(u.kind==='hero'){g.add(createKael());Object.assign(g.userData,{phase:0,walk:0,attack:0,spin:0,dashing:false,lean:0,fireClock:0,fireTime:0});}else{
 const hero=false,s=.65;
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
 if(hero){cube(.55,.24,.72,-.57,1.77,0,steel);cube(.43,.18,.65,.57,1.75,0,gold);cube(.72,.75,.13,0,1.3,.36,dark);cube(.85,.14,.17,0,1.65,-.35,gold);
 cube(.66,.56,.12,0,1.39,-.34,dark);const emblem=cube(.21,.21,.09,0,1.47,-.44,gold);emblem.rotation.z=Math.PI/4;
 for(const x of [-.23,.23]){cube(.31,.2,.12,x,1.15,-.35,steel);cube(.36,.24,.48,x,.18,-.08,dark);}
 for(let i=0;i<3;i++)cube(.74-i*.05,.23,.09,0,1.12-i*.23,.4+i*.035,cloth);
 for(let i=0;i<4;i++){const lock=cube(.2,.18+i*.035,.57,-.27+i*.16,2.69+i*.025,.02,hair);lock.rotation.z=-.18;}
 }
 const limb=(name:string,x:number,y:number,w:number,h:number,mat:THREE.Material)=>{const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x*s,y*s,0);g.add(pivot);const m=new THREE.Mesh(new THREE.BoxGeometry(w*s,h*s,.36*s),mat);m.position.y=-h*s/2;m.castShadow=true;pivot.add(m);return pivot;};
 limb('leftLeg',-.24,.87,.32,.78,dark);limb('rightLeg',.24,.87,.32,.78,dark);
 limb('leftArm',-.61,1.7,.3,.83,cloth);const arm=limb('rightArm',.61,1.7,.3,.83,cloth);
 const hand=new THREE.Mesh(new THREE.BoxGeometry(.32*s,.28*s,.34*s),hero?skin:dark);hand.position.y=-.76*s;arm.add(hand);
 const weapon=new THREE.Group();weapon.name='weapon';weapon.position.set(0,-.76*s,-.08*s);arm.add(weapon);
 const part=(w:number,h:number,d:number,z:number,mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w*s,h*s,d*s),mat);m.position.z=z*s;m.castShadow=true;weapon.add(m);return m;};
 part(.16,.16,.44,0,dark);part(.58,.16,.16,-.27,gold);
 part(hero?.37:.2,.12,hero?1.65:.9,hero?-1.17:-.8,steel);
 if(hero){part(.12,.14,1.7,-1.17,gold);const tip=part(.26,.12,.32,-2.08,steel);tip.rotation.y=Math.PI/4;
 const end=new THREE.Object3D();end.name='bladeTip';end.position.z=-2.2;weapon.add(end);
 const root=new THREE.Object3D();root.name='bladeRoot';root.position.z=-.4;weapon.add(root);
 const ember=new THREE.MeshBasicMaterial({color:0xffa33e,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false});
 for(let i=0;i<6;i++){const flame=new THREE.Mesh(new THREE.ConeGeometry(.065,.28,4),ember);flame.name='bladeFlame';flame.position.set(i%2?.17:-.17,.04,-.45-i*.27);weapon.add(flame);}
 }
 const rig=new THREE.Group();rig.name='body';for(const child of [...g.children])rig.add(child);g.add(rig);
 g.userData.phase=0;g.userData.walk=0;g.userData.attack=0;g.userData.spin=0;g.userData.dashing=false;g.userData.lean=0;g.userData.fireClock=0;g.userData.fireTime=0;

 }

 const ring=new THREE.Mesh(new THREE.RingGeometry(u.kind==='tower'?1.6:heroRadius(u),u.kind==='tower'?1.75:heroRadius(u)+.12,32),new THREE.MeshBasicMaterial({color:blue?0x63b8ff:0xff6868,side:THREE.DoubleSide,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;ring.position.y=.09;g.add(ring);this.scene.add(g);this.unitMeshes.set(u.id,g);}
 sync(units:Unit[],dt:number){for(const u of units){let g=this.unitMeshes.get(u.id);if(!g){this.createUnit(u);g=this.unitMeshes.get(u.id)!;}g.visible=u.alive;const moved=Math.hypot(u.x-g.position.x,u.z-g.position.z);g.position.set(u.x,0,u.z);
 if(u.kind!=='tower'){
 const body=g.getObjectByName('body')!;
 // Keep world position responsive; only the visual pose eases into each step.
 g.rotation.y=u.facing;
 const moving=moved>.0001&&!g.userData.dashing;
 const blend=1-Math.exp(-dt*16);
 g.userData.walk+=(Number(moving)-g.userData.walk)*blend;
 const weight=g.userData.walk;
 g.userData.phase+=moved*(u.kind==='hero'?3.6:5);
 const cape=g.getObjectByName('cape');if(cape){cape.rotation.x=.08+g.userData.walk*.16+Math.sin(g.userData.phase*.7)*.045;cape.rotation.z=Math.sin(g.userData.phase)*.055;}
 const phase=g.userData.phase,swing=Math.sin(phase)*.48*weight;
 body.position.y=(1-Math.cos(phase*2))*.035*weight;
 body.rotation.z=Math.sin(phase)*.035*weight;
 body.rotation.y=Math.sin(phase)*.045*weight;
 const leanTarget=g.userData.dashing?-.6:-.06*weight;
 g.userData.lean+=(leanTarget-g.userData.lean)*(1-Math.exp(-dt*24));body.rotation.x=g.userData.lean;
 const pose=(name:string,x:number,y=0,z=0)=>{const limb=g.getObjectByName(name);if(limb)limb.rotation.set(x,y,z);};
 pose('leftLeg',swing);pose('rightLeg',-swing);
 pose('leftShin',-Math.max(0,-Math.sin(phase))*.42*weight);pose('rightShin',-Math.max(0,Math.sin(phase))*.42*weight);pose('leftForearm',.16);pose('rightForearm',.12);
 pose('leftArm',-swing*.65,0,.04);pose('rightArm',swing*.45-.12,0,-.08);
 if(g.userData.dashing){pose('leftArm',.65,0,.2);pose('rightArm',-.8,0,-.35);pose('leftLeg',.65);pose('rightLeg',-.4);}
 if(g.userData.attack>0){
 const t=1-g.userData.attack/.42;
 // Wind up, fast sword sweep, then a controlled return to the ready pose.
 const hit=t<.28?t/.28:t<.58?1-(t-.28)/.3:0;
 const recovery=t<.58?1:Math.max(0,(1-t)/.42);
 pose('rightArm',-.45-1.1*hit,(-.9+2.1*Math.min(1,t/.58))*recovery,-.7*recovery);
 pose('leftArm',-.25,0,.18*recovery);body.rotation.y+=(-.28+.75*Math.min(1,t/.58))*recovery;
 g.userData.attack=Math.max(0,g.userData.attack-dt);
 }
 if(g.userData.spin>0){
 const t=1-g.userData.spin/.58,ease=t*t*(3-2*t);
 body.rotation.y= Math.PI*2*ease;body.rotation.z=0;
 pose('rightArm',0,-Math.PI/2,.1);pose('leftArm',-.3,0,.5);
 body.position.y+=Math.sin(t*Math.PI)*.12;
 g.userData.spin=Math.max(0,g.userData.spin-dt);
 if(g.userData.spin===0)body.rotation.y=0;
 }

 if(u.kind==='hero'&&u.alive){
 g.userData.fireTime+=dt;
 const hot=g.userData.spin>0;
 g.traverse(o=>{if(o.name.startsWith('bladeFlame')){const pulse=.8+Math.sin(g.userData.fireTime*17+o.position.z*9)*.2;o.scale.set(hot?1.6:1,pulse*(hot?2.3:1),1);}});
 g.updateMatrixWorld(true);
 const tip=g.getObjectByName('bladeTip')!.getWorldPosition(new THREE.Vector3());
 const root=g.getObjectByName('bladeRoot')!.getWorldPosition(new THREE.Vector3());
 const previous=g.userData.previousTip as THREE.Vector3|undefined;
 const previousRoot=g.userData.previousRoot as THREE.Vector3|undefined;
 if(hot&&previous&&previousRoot)this.flameRibbon(previousRoot,previous,root,tip);
 g.userData.previousRoot=root;
 g.userData.fireClock+=dt*(hot?240:16);
 const count=Math.min(24,Math.floor(g.userData.fireClock));g.userData.fireClock-=count;
 for(let i=0;i<count;i++){const t=(i+1)/Math.max(count,1);const pos=hot&&previous?previous.clone().lerp(tip,t):root.clone().lerp(tip,Math.random());this.ember(pos,hot);}
 g.userData.previousTip=tip;
 }
 }
 if(u.kind==='hero'){const glow=g.getObjectByName('shield');if(u.shield>0&&!glow){const sh=new THREE.Mesh(new THREE.SphereGeometry(1.8,12,8),new THREE.MeshBasicMaterial({color:0xffa438,wireframe:true,transparent:true,opacity:.32}));sh.position.y=1.7;sh.name='shield';g.add(sh);}else if(u.shield<=0&&glow)g.remove(glow);}}}
 flameRibbon(oldRoot:THREE.Vector3,oldTip:THREE.Vector3,root:THREE.Vector3,tip:THREE.Vector3){
 const innerOld=oldRoot.clone().lerp(oldTip,.28),inner=root.clone().lerp(tip,.28);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([...innerOld.toArray(),...oldTip.toArray(),...inner.toArray(),...tip.toArray()],3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute([1,.19,.015,1,.88,.42,1,.24,.02,1,.96,.65],3));geometry.setIndex([0,1,2,2,1,3]);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false}));this.scene.add(mesh);this.effects.push({mesh,ttl:.16,max:.16,fixed:true});
 }
 ember(position:THREE.Vector3,hot:boolean){
 if(this.fireParticles.length>=220)return;
 const mat=new THREE.MeshBasicMaterial({color:0xffd787,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false});
 const mesh=new THREE.Mesh(this.fireGeometry,mat);mesh.position.copy(position);mesh.scale.set(.045,.12,.045).multiplyScalar(hot?1.4:.6);mesh.rotation.z=Math.random();this.scene.add(mesh);
 const life=hot?.22+Math.random()*.14:.16+Math.random()*.16;
 this.fireParticles.push({mesh,life,max:life,velocity:new THREE.Vector3((Math.random()-.5)*.5,.65+Math.random()*.6,(Math.random()-.5)*.5)});
 }
 animateSkill(u:Unit,key:string){const g=this.unitMeshes.get(u.id);if(!g)return;if(key==='q'){g.userData.spin=.58;g.userData.attack=0;g.userData.previousTip=undefined;g.userData.previousRoot=undefined;} }
 setDash(u:Unit,active:boolean){const g=this.unitMeshes.get(u.id);if(g)g.userData.dashing=active;}
 slash(x:number,z:number,angle:number,color=0xffce75,r=1.7){
 const mesh=new THREE.Mesh(new THREE.RingGeometry(r*.7,r,24,1,-.95,1.9),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:1}));
 mesh.rotation.x=-Math.PI/2;mesh.rotation.z=angle+Math.PI/2;mesh.position.set(x,.85,z);this.scene.add(mesh);this.effects.push({mesh,ttl:.22,max:.22});
 }
 strike(from:Unit,to:Unit){const model=this.unitMeshes.get(from.id);if(model)model.userData.attack=.42;from.facing=Math.atan2(from.x-to.x,from.z-to.z);this.slash(from.x,from.z,from.facing,from.team==='blue'?0x91edff:0xff7c74,from.kind==='hero'?1.8:1.2);this.burst(to.x,to.z,0xffdba0,.65,.18);}
 burst(x:number,z:number,color:number,r=1.3,ttl=.35){const mesh=new THREE.Mesh(new THREE.RingGeometry(r*.5,r,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.85}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.25,z);this.scene.add(mesh);this.effects.push({mesh,ttl,max:ttl});}
 tick(dt:number){
 this.fireParticles=this.fireParticles.filter(p=>{p.life-=dt;const t=1-p.life/p.max;const m=p.mesh.material as THREE.MeshBasicMaterial;m.color.setRGB(1,Math.max(.13,.8-t*.7),Math.max(.015,.3-t*.45));m.opacity=Math.max(0,(1-t)*.75);p.mesh.position.addScaledVector(p.velocity,dt);p.mesh.scale.multiplyScalar(Math.exp(-dt*2));if(p.life<=0){this.scene.remove(p.mesh);m.dispose();return false;}return true;});
 this.effects=this.effects.filter(e=>{e.ttl-=dt;const material=(e.mesh as THREE.Mesh).material;if(material instanceof THREE.MeshBasicMaterial){material.opacity=Math.max(0,e.ttl/e.max);}if(!e.fixed)e.mesh.scale.multiplyScalar(1+dt*1.8);if(e.ttl<=0){this.scene.remove(e.mesh);const m=e.mesh as THREE.Mesh;m.geometry?.dispose();if(m.material instanceof THREE.Material)m.material.dispose();return false;}return true;});}
 resize(w:number,h:number){this.renderer.setSize(w,h,false);}render(camera:THREE.Camera){this.renderer.render(this.scene,camera);}
}
function heroRadius(u:Unit){return u.kind==='hero'?.8:.48;}
