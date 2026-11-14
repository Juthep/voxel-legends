import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
let template:THREE.Group|null=null;
/** Parse the authored, continuously sculpted mesh and its weighted skeleton. */
export async function prepareKael(bytes:ArrayBuffer){
 const header=new Uint8Array(bytes,0,2);
 if(header[0]===0x1f&&header[1]===0x8b){bytes=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}
 const gltf=await new GLTFLoader().parseAsync(bytes,'');
 template=gltf.scene;
 template.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});
}
export async function loadKael(){
 const response=await fetch('/models/kael-sculpt-v1.glb.gz');
 if(!response.ok)throw new Error('Não foi possível carregar o personagem. Atualize a página para tentar novamente.');
 await prepareKael(await response.arrayBuffer());
}
export function createKael():THREE.Group{
 if(!template)throw new Error('O modelo de Kael ainda não foi carregado.');
 const model=clone(template) as THREE.Group;
 model.name='body';return model;
}
