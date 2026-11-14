import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Original articulated stylized character. Forward is -Z; weapon space matches combat VFX. */
export function createKael():T.Group {
 const body=new T.Group();body.name='body';
 const material=(color:number,metalness=0,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const skin=material(0xdca07a),hair=material(0x30242b),hairLight=material(0x493039);
 const teal=material(0x164f60),tealLight=material(0x287481),armor=material(0x303c4e,.65,.36),edge=material(0x68778c,.7,.3),gold=material(0xba8744,.7,.32),leather=material(0x392e30),steel=material(0xc1d6dc,.8,.22);
 const ember=new T.MeshStandardMaterial({color:0xffb04b,emissive:0xff751a,emissiveIntensity:1.7,metalness:.3,roughness:.3});
 const mesh=(parent:T.Object3D,geometry:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0)=>{const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const round=(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,r=.06)=>mesh(parent,new RoundedBoxGeometry(w,h,d,2,r),mat,x,y,z);
 const oval=(parent:T.Object3D,x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:T.Material)=>{const m=mesh(parent,new T.SphereGeometry(1,16,12),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const plate=(parent:T.Object3D,points:number[][],depth:number,mat:T.Material,x=0,y=0,z=0)=>{const shape=new T.Shape(points.map(p=>new T.Vector2(p[0],p[1])));return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.018}),mat,x,y,z);};
 // Tailored torso, tapered waist, layered breastplate and bronze piping.
 const profile=[new T.Vector2(.31,0),new T.Vector2(.36,.2),new T.Vector2(.48,.66),new T.Vector2(.4,.84)];
 const torso=mesh(body,new T.LatheGeometry(profile,12),teal,0,.91,0);torso.scale.z=.62;
 for(const side of [-1,1]){const breast=oval(body,side*.18,1.48,-.2,.255,.265,.18,armor);breast.rotation.z=side*.12;}
 round(body,.52,.19,.44,0,1.2,-.025,armor,.065);
 for(const side of [-1,1]){const strap=round(body,.1,.78,.08,side*.08,1.45,-.36,leather,.025);strap.rotation.z=side*.65;
 for(let i=0;i<2;i++)plate(body,[[-.16,0],[-.18,.15],[.16,.15],[.14,-.04]],.07,edge,side*.19,1.06+i*.14,-.34);}
 const emblem=round(body,.27,.27,.1,0,1.49,-.43,gold,.035);emblem.rotation.z=Math.PI/4;
 const gem=round(body,.15,.15,.08,0,1.49,-.51,ember,.025);gem.rotation.z=Math.PI/4;
 round(body,.77,.17,.52,0,.99,0,leather,.045);round(body,.23,.19,.09,0,.99,-.32,gold,.025);round(body,.12,.1,.1,0,.99,-.38,leather,.02);
 const headStart=body.children.length;
 // Narrow collar and an expressive face with chin, nose, brows and swept hair.
 mesh(body,new T.CylinderGeometry(.17,.19,.22,12),skin,0,1.91,0);
 oval(body,0,2.22,0,.33,.39,.285,skin);
 oval(body,0,2.02,-.06,.235,.16,.22,skin);
 for(const side of [-1,1]){
 oval(body,side*.335,2.19,0,.05,.085,.055,skin);
 const eye=oval(body,side*.13,2.25,-.257,.068,.041,.018,material(0xfff2d8));
 oval(body,side*.13,2.25,-.278,.028,.035,.009,material(0xb37026));oval(body,side*.13,2.25,-.289,.014,.027,.006,hair);
 const brow=round(body,.15,.038,.032,side*.13,2.34,-.257,hair,.009);brow.rotation.z=side*.12;
 }
 oval(body,0,2.16,-.285,.035,.05,.04,skin);round(body,0.11,.017,.018,0,2.04,-.254,leather,.006);
 const cap=oval(body,0,2.43,.045,.35,.23,.29,hair);cap.rotation.x=-.12;
 // Swept tapered locks, formed from rings rather than stacked blocks.
 function lock(start:T.Vector3,end:T.Vector3,width:number,mat:T.Material){const vertices:number[]=[],indices:number[]=[];const tangent=end.clone().sub(start).normalize();const across=new T.Vector3(0,0,1).cross(tangent).normalize();const normal=tangent.clone().cross(across).normalize();for(let j=0;j<4;j++){const t=j/3,c=start.clone().lerp(end,t);c.z-=Math.sin(t*Math.PI)*.07;const r=width*(1-t*.95);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const v=c.clone().addScaledVector(across,Math.cos(a)*r).addScaledVector(normal,Math.sin(a)*r*.65);vertices.push(...v.toArray());if(j<3){const n=j*6+k,b=j*6+(k+1)%6;indices.push(n,b,n+6,b,b+6,n+6);}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(body,geo,mat);}
 for(let i=0;i<9;i++){const x=-.29+i*.068;lock(new T.Vector3(x,2.54,.04),new T.Vector3(x-.17,2.34+Math.sin(i*.6)*.1,-.28),.1,i%3?hair:hairLight);}
 for(const side of [-1,1])for(let i=0;i<3;i++)lock(new T.Vector3(side*.28,2.42,.08+i*.06),new T.Vector3(side*.34,2.09+i*.045,.07+i*.07),.09,hair);
 const head=new T.Group();head.position.y=2.2;for(const child of body.children.slice(headStart)){child.position.y-=2.2;head.add(child);}head.scale.setScalar(.92);body.add(head);
 // Split cloth cape, with a curved silhouette and independent sway.
 const cape=new T.Group();cape.name='cape';cape.position.set(0,1.8,.2);body.add(cape);
 for(const side of [-1,1]){const geo=new T.BufferGeometry(),v:number[]=[],ix:number[]=[];for(let row=0;row<6;row++){const t=row/5;for(let col=0;col<4;col++){const q=col/3;v.push(side*(.025+q*(.3+t*.25)),-t*1.12,.04+t*.3+Math.sin(q*Math.PI*3)*.035);if(row<5&&col<3){const a=row*4+col;ix.push(a,a+1,a+4,a+1,a+5,a+4);}}}geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const cloth=tealLight.clone();cloth.side=T.DoubleSide;mesh(cape,geo,cloth);}
 // Articulated armored limbs; retained pivot names preserve movement and skill timing.
 const limb=(name:string,x:number,y:number)=>{const g=new T.Group();g.name=name;g.position.set(x,y,0);body.add(g);return g;};
 for(const side of [-1,1]){
 const leg=limb(side<0?'leftLeg':'rightLeg',side*.235,.91);
 oval(leg,0,-.24,0,.17,.28,.16,leather);
 round(leg,.31,.32,.32,0,-.27,-.015,armor,.07);
 oval(leg,0,-.46,-.06,.17,.14,.17,edge);
 round(leg,.29,.32,.29,0,-.64,0,armor,.065);
 round(leg,.34,.18,.49,0,-.8,-.09,leather,.065);
 const arm=limb(side<0?'leftArm':'rightArm',side*.49,1.74);
 oval(arm,0,-.2,0,.16,.25,.16,teal);oval(arm,0,-.43,0,.14,.13,.14,skin);
 round(arm,.28,.27,.3,0,-.57,0,armor,.06);round(arm,.31,.09,.33,0,-.49,0,edge,.03);
 oval(arm,0,-.76,-.02,.14,.15,.14,leather);
 const pauldron=round(arm,side>0?.52:.44,.24,.51,side*.05,-.01,0,side>0?gold:edge,.065);pauldron.rotation.z=side*.2;
 for(let i=0;i<2;i++)round(arm,.39-i*.04,.12,.43-i*.03,side*.07,-.14-i*.095,0,side>0?gold:armor,.04);
 }
 const arm=body.getObjectByName('rightArm')!;
 const weapon=new T.Group();weapon.name='weapon';weapon.position.set(0,-.76,-.08);arm.add(weapon);
 const grip=mesh(weapon,new T.CylinderGeometry(.075,.075,.44,10),leather);grip.rotation.x=Math.PI/2;
 for(let i=0;i<5;i++){const band=mesh(weapon,new T.TorusGeometry(.077,.012,4,10),gold,0,0,-.17+i*.075);}
 oval(weapon,0,0,.24,.115,.09,.09,gold);
 const guard=plate(weapon,[[-.39,-.02],[-.31,.13],[-.12,.08],[0,.13],[.12,.08],[.31,.13],[.39,-.02],[.15,-.06],[0,-.02],[-.15,-.06]],.12,gold,0,0,-.26);guard.rotation.x=-Math.PI/2;
 const blade=plate(weapon,[[-.18,.36],[-.24,.6],[-.18,1.8],[0,2.27],[.18,1.8],[.24,.6],[.18,.36]],.085,steel);blade.rotation.x=-Math.PI/2;blade.position.y=-.04;
 const fuller=plate(weapon,[[-.04,.42],[-.055,1.78],[0,2.14],[.055,1.78],[.04,.42]],.015,gold);fuller.rotation.x=-Math.PI/2;fuller.position.y=.07;
 const core=plate(weapon,[[-.018,.52],[-.018,1.77],[0,2.06],[.018,1.77],[.018,.52]],.01,ember);core.rotation.x=-Math.PI/2;core.position.y=.095;
 const tip=new T.Object3D();tip.name='bladeTip';tip.position.z=-2.27;weapon.add(tip);
 const root=new T.Object3D();root.name='bladeRoot';root.position.z=-.42;weapon.add(root);
 const flameMat=new T.MeshBasicMaterial({color:0xffb64c,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false});
 for(let i=0;i<9;i++){const flame=mesh(weapon,new T.ConeGeometry(.045,.2,5),flameMat,i%2?.17:-.17,.05,-.5-i*.17);flame.name='bladeFlame';}
 body.userData.design='Kael — Ember Knight';return body;
}
