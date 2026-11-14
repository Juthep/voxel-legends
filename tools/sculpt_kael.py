"""Build the original continuous Kael mesh in Blender. Front is +Y, height is Z."""
import bpy, math, json, bmesh
from mathutils import Vector
from pathlib import Path
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
M={}
def mat(name,color,metal=0,rough=.6,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if emission:bs.inputs['Emission Color'].default_value=(*color,1);bs.inputs['Emission Strength'].default_value=emission
 M[name]=m;return m
mat('skin',(.56,.29,.16),0,.78);mat('teal',(.025,.15,.17));mat('teal-edge',(.055,.25,.27));mat('iron',(.085,.11,.16),.72,.34);mat('steel',(.43,.54,.6),.8,.26);mat('gold',(.49,.28,.085),.75,.31);mat('leather',(.075,.038,.025));mat('hair',(.052,.023,.017));mat('hair-light',(.1,.047,.024));mat('ivory',(.85,.8,.65));mat('iris',(.55,.21,.025),.2);mat('pupil',(.012,.008,.008));mat('ember',(1,.27,.015),.3,.3,2)
def finish(obj,name,material,binding='skin',smooth=True):
 obj.name=name;obj.data.materials.append(M[material]);obj['binding']=binding
 bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(obj.data);bm.free()
 for p in obj.data.polygons:p.use_smooth=smooth
 return obj

def ell(name,pos,scale,material='skin',binding='skin',seg=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=pos);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material,binding)
def loft(name,sections,material,binding='skin',n=24):
 # each section: center, width, depth; connected elliptical cross sections
 vs=[];faces=[]
 for (x,y,z),w,d in sections:
  for k in range(n):a=k*2*math.pi/n;vs.append((x+w*math.cos(a),y+d*math.sin(a),z))
 for j in range(len(sections)-1):
  for k in range(n):a=j*n+k;b=j*n+(k+1)%n;faces.append((a,b,b+n,a+n))
 faces.append(tuple(range(n-1,-1,-1)));faces.append(tuple((len(sections)-1)*n+k for k in range(n)))
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);return finish(o,name,material,binding)
def tube(name,points,radii,material,binding='body',n=10):
 vs=[];fs=[]
 for j,p in enumerate(points):
  p=Vector(p);tangent=(Vector(points[min(j+1,len(points)-1)])-Vector(points[max(j-1,0)])).normalized();u=tangent.cross(Vector((0,1,0)))
  if u.length<.01:u=tangent.cross(Vector((1,0,0)))
  u.normalize();v=tangent.cross(u).normalized()
  for k in range(n):a=k*2*math.pi/n;vs.append(p+u*math.cos(a)*radii[j]+v*math.sin(a)*radii[j])
 for j in range(len(points)-1):
  for k in range(n):a=j*n+k;b=j*n+(k+1)%n;fs.append((a,b,b+n,a+n))
 fs+=[tuple(range(n-1,-1,-1)),tuple((len(points)-1)*n+k for k in range(n))]
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);return finish(o,name,material,binding)
def ribbon(name,points,width,material,binding='body'):
 vs=[]
 for i,p in enumerate(points):
  tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)]);side=Vector((-tangent.z,0,tangent.x)).normalized()*width/2;vs.extend([Vector(p)-side,Vector(p)+side])
 fs=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(points)-1)];me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);finish(o,name,material,binding)
 sol=o.modifiers.new('Leather thickness','SOLIDIFY');sol.thickness=.018;bev=o.modifiers.new('Soft seams','BEVEL');bev.width=.009;bev.segments=2;return o
# Continuous anatomical foundation, union-remeshed into ONE watertight surface.
core=[]
core.append(loft('Anatomy torso',[((0,0,1.5),.29,.19),((0,0,1.7),.3,.2),((0,0,1.92),.28,.18),((0,0,2.12),.35,.22),((0,0,2.36),.46,.245),((0,0,2.54),.48,.21),((0,0,2.65),.36,.17)],'skin'))
core.append(ell('Pelvis',(0,-.015,1.57),(.35,.22,.27)))
core.append(ell('Neck',(0,0,2.75),(.14,.14,.24)))
core.append(loft('Face',[((0,.025,2.84),.12,.14),((0,.035,2.9),.19,.185),((0,.025,3.02),.235,.22),((0,0,3.15),.25,.235),((0,-.01,3.28),.245,.22),((0,-.015,3.39),.19,.18),((0,-.015,3.44),.05,.07)],'skin'))
for side in [-1,1]:
 core.append(ell('Trapezius',(side*.29,-.015,2.61),(.27,.17,.13)))
 core.append(ell('Deltoid',(side*.52,0,2.56),(.225,.21,.23)))
 core.append(loft('Arm',[((side*.54,0,2.6),.16,.17),((side*.61,0,2.43),.16,.165),((side*.67,0,2.25),.135,.14),((side*.7,0,2.13),.11,.115),((side*.74,.005,1.97),.13,.135),((side*.78,.015,1.8),.095,.105),((side*.8,.02,1.69),.08,.085)],'skin'))
 core.append(ell('Biceps',(side*.63,.06,2.34),(.145,.145,.22)))
 core.append(loft('Leg',[((side*.2,0,1.64),.21,.2),((side*.23,.015,1.4),.205,.2),((side*.245,.01,1.15),.16,.17),((side*.25,.025,.96),.125,.135),((side*.25,.02,.83),.13,.145),((side*.25,-.015,.65),.145,.16),((side*.25,-.01,.42),.105,.12),((side*.25,0,.2),.075,.09)],'skin'))
 core.append(ell('Palm',(side*.8,.015,1.62),(.095,.1,.135)))
 core.append(ell('Ear',(side*.252,-.005,3.12),(.048,.055,.09)))
core.append(ell('Nose bridge',(0,.22,3.11),(.035,.055,.09)))
core.append(ell('Nose tip',(0,.263,3.06),(.04,.045,.035)))
bpy.ops.object.select_all(action='DESELECT')
for o in core:o.select_set(True)
bpy.context.view_layer.objects.active=core[0];bpy.ops.object.join();o=bpy.context.object;o.name='Kael continuous anatomy'
rem=o.modifiers.new('Sculpt union','REMESH');rem.mode='VOXEL';rem.voxel_size=.025;rem.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=rem.name)
sm=o.modifiers.new('Relax sculpt','SMOOTH');sm.factor=1.2;sm.iterations=5;bpy.ops.object.modifier_apply(modifier=sm.name)
dec=o.modifiers.new('Game topology','DECIMATE');dec.ratio=.48;bpy.ops.object.modifier_apply(modifier=dec.name)
# Fitted cloth and layered curved armor (no boxes).
loft('Fitted tunic',[((0,0,1.56),.36,.275),((0,0,1.8),.31,.21),((0,0,2.02),.325,.22),((0,0,2.24),.42,.26),((0,0,2.48),.51,.28),((0,0,2.6),.5,.24),((0,0,2.72),.23,.17),((0,0,2.78),.155,.15)],'teal','body')
loft('Leather war belt',[((0,0,1.66),.338,.237),((0,0,1.77),.335,.235)],'leather','body')
# Cuirass is a wrapped elliptical shell, anatomically tapered, with a sculpted center ridge.
loft('Forged cuirass',[((0,.015,1.82),.36,.28),((0,.015,2.02),.4,.30),((0,0,2.22),.49,.33),((0,-.005,2.42),.54,.34),((0,-.005,2.54),.53,.31)],'iron','body')
for side in [-1,1]:
 # Side contour piping and crossed leather harness.
 tube('Bronze cuirass rim',[(side*.3,.09,1.83),(side*.37,.16,2.12),(side*.43,.125,2.36),(side*.36,.09,2.51)],[.014]*4,'gold')
 ribbon('Harness',[(side*.29,.17,2.54),(side*.17,.35,2.34),(side*.05,.35,2.14),(-side*.12,.31,1.88)],.065,'leather')
 for j in range(2):
  ell('Abdominal lames',(side*.16,.22,1.9+j*.115),(.17,.075,.09),'iron','body')
 # Gold layered asymmetric pauldrons, sculpted onto shoulders.
 color='gold' if side==1 else 'steel'
 cap=ell('Pauldron',(side*.53,-.015,2.62),(.28,.265,.18),color,'rightArm' if side==1 else 'leftArm')
 for j in range(2):ell('Shoulder lames',(side*(.58+j*.015),.005,2.48-j*.09),(.235-j*.015,.23-j*.01,.09),color,'rightArm' if side==1 else 'leftArm')
 # Bracers follow the forearm instead of hiding it inside a rectangular block.
 for j in range(3):
  z=1.82+j*.1;x=side*(.79-j*.02)
  ell('Forged vambrace',(x,0,z),(.155+j*.004,.17,.105),'iron','rightForearm' if side==1 else 'leftForearm')
 for j in range(2):ell('Bracer trim',(side*(.785-j*.04),0,1.79+j*.26),(.16,.177,.026),'gold','rightForearm' if side==1 else 'leftForearm')
 loft('Trousers',[((side*.2,0,1.65),.24,.24),((side*.23,0,1.42),.238,.24),((side*.245,0,1.17),.19,.2),((side*.25,0,1.02),.16,.17),((side*.25,0,.86),.145,.16)],'leather','rightLeg' if side==1 else 'leftLeg')
 ell('Kneecap',(side*.25,.13,.96),(.15,.11,.17),'iron','rightLeg' if side==1 else 'leftLeg')
 loft('Sabatons',[((side*.25,.02,.12),.135,.2),((side*.25,0,.3),.12,.145),((side*.25,-.01,.56),.145,.165),((side*.25,0,.8),.137,.16)],'iron','rightShin' if side==1 else 'leftShin')
 ell('Boot',(side*.25,.13,.12),(.145,.28,.115),'leather','rightShin' if side==1 else 'leftShin')
 tube('Greave ridge',[(side*.25,.17,.29),(side*.25,.18,.51),(side*.25,.18,.75)],[.018,.025,.016],'steel','rightShin' if side==1 else 'leftShin')
 # Gloves with curled fingers around the sword grip.
 ell('Glove',(side*.8,.015,1.64),(.101,.105,.13),'leather','rightHand' if side==1 else 'leftHand')
 for k in range(3):ell('Fingers',(side*.8+(.04-k*.04),.08,1.6),(.024,.065,.034),'leather','rightHand' if side==1 else 'leftHand',16,10)
ell('Tailored trouser pelvis',(0,-.005,1.52),(.36,.265,.25),'leather','skin')
# Raised diamond brooch and belt clasp.
for z,size,material in [(2.28,.12,'gold'),(2.28,.075,'ember'),(1.715,.085,'gold')]:
 e=ell('Ember sigil',(0,.36 if z>2 else .25,z),(size,.035,size),material,'body',4,4)
# Face is sculpted, eyes sit inside sockets rather than on top as spheres.
for side in [-1,1]:
 ell('Eye socket',(side*.095,.213,3.17),(.075,.019,.044),'leather','head')
 ell('Eye',(side*.095,.23,3.17),(.05,.011,.022),'ivory','head')
 ell('Iris',(side*.095,.241,3.17),(.021,.006,.023),'iris','head',16,10)
 ell('Pupil',(side*.095,.247,3.17),(.009,.003,.017),'pupil','head',12,8)
 tube('Eyebrow',[(side*.035,.227,3.226),(side*.1,.23,3.239),(side*.16,.2,3.233)],[.012,.016,.006],'hair','head',8)
 tube('Upper eyelid',[(side*.04,.231,3.18),(side*.095,.244,3.196),(side*.151,.219,3.181)],[.005,.007,.003],'skin','head',8)
tube('Mouth',[(-.06,.218,2.977),(0,.237,2.973),(.06,.218,2.979)],[.003,.005,.002],'leather','head',8)
# Sculpted swept hair cap plus individual curved tapered clumps.
ell('Hair mass',(0,-.055,3.345),(.258,.225,.165),'hair','head')
for i in range(10):
 x=-.21+i*.046
 tube('Swept fringe',[(x,-.09,3.4),(x+.04,.045,3.48),(x-.025,.17,3.39),(x-.11,.215,3.27+(i/10)*.07)],[.065,.063,.043,.002],'hair-light' if i%4==0 else 'hair','head',10)
for side in [-1,1]:
 for i in range(4):tube('Side swept locks',[(side*.19,-.1+i*.055,3.37),(side*.26,-.12+i*.04,3.3),(side*.25,-.12+i*.035,3.12)],[.07,.055,.002],'hair','head')
# Flowing split mantle, continuous draped mesh with gold edge.
for side in [-1,1]:
 vs=[];fs=[]
 for j in range(13):
  t=j/12
  for k in range(9):
   u=k/8;x=side*(.025+u*(.32+.27*t));y=-.19-.24*t+.04*math.sin(u*math.pi*4);z=2.58-1.31*t-.06*math.sin(u*math.pi)
   vs.append((x,y,z))
   if j<12 and k<8:a=j*9+k;fs.append((a,a+1,a+10,a+9))
 me=bpy.data.meshes.new('Mantle');me.from_pydata(vs,[],fs);me.update();c=bpy.data.objects.new('Split mantle',me);bpy.context.collection.objects.link(c);finish(c,'Split mantle','teal-edge','cape');mod=c.modifiers.new('Cloth thickness','SOLIDIFY');mod.thickness=.014
 tube('Mantle edge',[(side*(.345+.27*t),-.19-.24*t,2.58-1.31*t) for t in [0,.25,.5,.75,1]],[.014]*5,'gold','cape')
# Broad beveled steel sword. All parts bind rigidly to the right wrist.
def sword_panel(name,outline,thick,material):
 vs=[(.8+x,y,1.65+h) for h in [-thick/2,thick/2] for x,y in outline];n=len(outline);fs=[tuple(range(n-1,-1,-1)),tuple(n+i for i in range(n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)];me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);finish(o,name,material,'weapon');bev=o.modifiers.new('Honed bevel','BEVEL');bev.width=.015;bev.segments=2;return o
tube('Sword leather grip',[(.8,-.18,1.65),(.8,.24,1.65)],[.06,.06],'leather','weapon',12)
sword_panel('Quillon',[(-.35,.24),(-.3,.36),(-.1,.32),(0,.37),(.1,.32),(.3,.36),(.35,.24),(.13,.21),(-.13,.21)],.13,'gold')
sword_panel('Honed blade',[(-.14,.37),(-.2,.6),(-.14,1.95),(0,2.32),(.14,1.95),(.2,.6),(.14,.37)],.075,'steel')
sword_panel('Blade fuller',[(-.04,.42),(-.045,1.9),(0,2.19),(.045,1.9),(.04,.42)],.091,'gold')
sword_panel('Ember inlay',[(-.012,.5),(-.015,1.87),(0,2.08),(.015,1.87),(.012,.5)],.098,'ember')
# Export evaluated triangles and materials for building a portable skinned GLB.
out={'materials':{},'meshes':[]}
for name,m in M.items():out['materials'][name]={'color':list(m.diffuse_color[:3]),'metalness':m.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value,'roughness':m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value,'emission':m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value}
deps=bpy.context.evaluated_depsgraph_get()
for obj in list(bpy.context.scene.objects):
 if obj.type!='MESH':continue
 ev=obj.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles();vs=[obj.matrix_world@v.co for v in me.vertices]
 out['meshes'].append({'name':obj.name,'material':obj.data.materials[0].name,'binding':obj.get('binding','body'),'positions':[round(n,5) for v in vs for n in (v.x,v.z,-v.y)],'indices':[k for t in me.loop_triangles for k in t.vertices]});ev.to_mesh_clear()
Path('/tmp/kael-sculpt.json').write_text(json.dumps(out,separators=(',',':')))
bpy.ops.wm.save_as_mainfile(filepath='/tmp/kael-sculpt.blend')
print('Sculpt exported:',sum(len(m['positions'])//3 for m in out['meshes']),'vertices')
