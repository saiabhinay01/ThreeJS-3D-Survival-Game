import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { color, velocity } from 'three/tsl';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4.61,2.74,8)
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();
const playerTexture = textureLoader.load('/play.jpg');
const enetexture = textureLoader.load('/enemy.webp');
scene.background = new THREE.Color(0x87ceeb);
class box extends THREE.Mesh {
  constructor({ width, height, depth, color = 'white',texture=null, velocity = { x: 0, y: 0, z: 0 }, position = { x: 0, y: 0, z: 0 },acc=false}) {
    super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color ,map:texture}));

    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position.set(position.x, position.y, position.z);
    
    this.velocity = velocity;
    this.gravity = -0.003;
    this.acc=acc;
  }

  updateSides(){
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    this.right = this.position.x+this.width/2;
    this.left = this.position.x-this.width/2;
    this.front = this.position.z+this.depth/2;
    this.back= this.position.z-this.depth/2;
  }
  update(ground) {
    this.updateSides();
    if(this.acc)
    this.velocity.z+=0.0003;

    this.position.x += this.velocity.x;
    this.position.z +=this.velocity.z;
    this.applygravity(ground);
  }
  applygravity(ground){
    this.velocity.y += this.gravity;
    if (collision({b1:this,b2:ground})){
      this.velocity.y *= -0.5;
    }
    else
      this.position.y += this.velocity.y;
  }
}

function collision({b1,b2}){
  const xc = b1.right>=b2.left && b1.left<=b2.right
  const yc = b1.top>=b2.bottom && b1.bottom+b1.velocity.y<=b2.top
  const zc = b1.front>=b2.back && b1.back<=b2.front

  return xc&&yc&&zc
}
const controls = new OrbitControls(camera, renderer.domElement);
const cube = new box({ width: 1, height: 1, depth: 1,color:'green',texture:playerTexture });
cube.castShadow = true;
const ground = new box({ width: 10, height: 0.5, depth: 50, color: 0x5c4033, position: { x: 0, y: -2, z: 0 } });
ground.updateSides()
ground.receiveShadow = true;
scene.add(ground);
scene.add(cube);
const enemies = [];

const light = new THREE.DirectionalLight(0xffffff, 10)
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight('white',0.5))
camera.position.z = 5;
const key={
  a:false,
  s:false,
  w:false,
  d:false
} 
window.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyA':
        key.a=true;
        break
      case 'KeyD':
        key.d=true;
        break
      case 'KeyS':
        key.s=true;
        break
      case 'KeyW':
        key.w=true;
        break;
      case 'Space':
        cube.velocity.y=0.1;
    }
  })
window.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyA':
        key.a=false;
        break
      case 'KeyD':
        key.d=false;
        break
      case 'KeyS':
        key.s=false;
        break
      case 'KeyW':
        key.w=false;
    }
  })

let frames=0;
let sr=200;
function animate() {
  const id = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if(key.a) cube.velocity.x=-0.05;
  else if(key.d) cube.velocity.x=0.05;
  else cube.velocity.x=0;
  if(key.w) cube.velocity.z=-0.05;
  else if(key.s) cube.velocity.z=0.05;
  else cube.velocity.z=0;
  
  cube.update(ground);
  enemies.forEach(enemy=>{
    enemy.update(ground);
    if(collision({b1:cube,b2:enemy})){
      cancelAnimationFrame(id);
    }
  })
  if(frames%sr === 0){
    if(sr>20) sr-=20;
    const ene = new box({ width: 1, height: 1, depth: 1,texture:enetexture,position:{x:(Math.random()-0.5)*10,y:0,z:-20},velocity:{x:0,y:0,z:0.01},acc:true});
    ene.castShadow = true;
    scene.add(ene);
    enemies.push(ene);
  }
  frames++;
}
animate();
