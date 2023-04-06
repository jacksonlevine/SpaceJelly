import "./style.css";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import ImprovedNoise from "./perlin.js";

const TimeStartedProgram = new Date();

enum InputState
{
  left = 0,
  right = 1 << 0,
  back = 1 << 1,
  forward = 1 << 2,
  up = 1 << 3,
  down = 1 << 4
}

class InputHandler
{
  ActiveState: InputState;
  constructor()
  {
    
  }
}

class World
{
  data: Map<string, Uint8Array>
  constructor()
  {
    this.data = new Map();
  }
  generate()
  {
    for(let j = 0; j < 20; j++)
    {
      for(let i = -500; i < 500; i++)
      {
        for(let k = -500; k < 500; k++)
        {
          if(ImprovedNoise.noise(j/25, i/25, k/25) > 0.2) { this.data.set(i+','+j+','+k, new Uint8Array(1)) } 
        }
      }
    } 
  }
}

let world = new World();
world.generate();

let input = new InputHandler();

// Canvas
const canvas: HTMLElement | null = document.querySelector("canvas");

const backfogcolor: THREE.ColorRepresentation = 0xcccccc

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(backfogcolor, 10, 200 );
// Camera
const camera = new THREE.PerspectiveCamera(
  75, // FOV - Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio - might need to be innerHeight/innerHeight
  0.1, // Near clipping distance limit
  100000 // Far clipping distance limit
);
camera.position.z = 3; // Pull the camera back a bit so you can see the object
scene.add(camera);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Create a basic white universal light  // TODO: Change this to a fancier light!
ambientLight.position.set(0, 0, 0); // Set position of the light
scene.add(ambientLight); 

const pointLight = new THREE.DirectionalLight(0xffffff, 0.5); // Create a point light
pointLight.position.set(0, 50, 0);
scene.add(pointLight);

// Controls
const controls = new PointerLockControls(camera, <HTMLElement | undefined>canvas);
// controls.enableDamping = false; // use to give a sense of weight
// controls.constrainVertical = true;
addEventListener(
  'click',
  function () {
      controls.lock()
  },
  false
)

const chunk_height = 20;
const chunk_width = 16;

// Material
const meshMaterial = new THREE.MeshLambertMaterial( { 
  color: 0xff0000,
  depthWrite:true 
});

class Chunk
{
  meshGeometry: THREE.BufferGeometry;
  vertices: Float32Array;
  mesh: THREE.Mesh;
  x: number;
  z: number;
  constructor()
  {
    this.meshGeometry = new THREE.BufferGeometry();
    this.vertices = new Float32Array(3);
    this.mesh = new THREE.Mesh(this.meshGeometry, meshMaterial );
    this.x = 0; //multiply x and z by 16 to get real-world position
    this.z = 0; 
  }
  buildmesh(newx, newz)
  {
    this.x = newx;
    this.z = newz;
    let newVerts = new Array<number>();
    let newNorms = new Array<number>();
    for(let j = 0; j < chunk_height; j++)
    {
      for(let i = 0; i < chunk_width; i++)
      {
        for(let k = 0; k < chunk_width; k++)
        {
          if(world.data.has(""+((this.x*16)+i)+","+(j)+","+((this.z*16)+k)))
          {
            if(!world.data.has(""+((this.x*16)+i-1)+","+(j)+","+((this.z*16)+k)))
            {
              newVerts.push(i, j, k);
              newVerts.push(i, j, k+1);
              newVerts.push(i, j+1, k+1);
              newVerts.push(i, j+1, k+1);
              newVerts.push(i, j+1, k);
              newVerts.push(i, j, k);
              for(let h = 0; h < 6; h++)
              {
                newNorms.push(-1, 0, 0);
              }
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j)+","+((this.z*16)+k-1)))
            {
              newVerts.push(i, j, k);
              newVerts.push(i, j+1, k);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i+1, j, k);
              newVerts.push(i, j, k);
              for(let h = 0; h < 6; h++)
              {
                newNorms.push(0, 0, -1);
              }
            }
            if(!world.data.has(""+((this.x*16)+i+1)+","+(j)+","+((this.z*16)+k)))
            {
              newVerts.push(i+1, j, k);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i+1, j, k);
              for(let h = 0; h < 6; h++)
              {
                newNorms.push(1, 0, 0);
              }
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j)+","+((this.z*16)+k+1)))
            {
              newVerts.push(i, j, k+1);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i, j+1, k+1);
              newVerts.push(i, j, k+1);
              for(let h = 0; h < 6; h++)
              {
                newNorms.push(0, 0, 1);
              }
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j-1)+","+((this.z*16)+k)))
            {
              newVerts.push(i, j, k);
              newVerts.push(i+1, j, k);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i, j, k+1);
              newVerts.push(i, j, k);
              for(let h = 0; h < 6; h++)
              {
                newNorms.push(0, -1, 0);
              }
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j+1)+","+((this.z*16)+k)))
            {
              newVerts.push(i, j+1, k);
              newVerts.push(i, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i, j+1, k);
              for(let h = 0; h < 6; h++)
              {
                newNorms.push(0, 1, 0);
              }
            }
          }
        }
      }
    }
    this.vertices = new Float32Array(newVerts);
    this.meshGeometry.setAttribute(
      "position", 
      new THREE.BufferAttribute(this.vertices, 3) 
    )
    this.meshGeometry.setAttribute(
      "normal", 
      new THREE.BufferAttribute(new Float32Array(newNorms), 3) 
    )
    this.mesh.position.set(this.x*16, 0, this.z*16);

    this.mesh.geometry =this.meshGeometry;
  }
}

let chunkpool = [];
let mappedChunks = new Map();
let neededChunks = new Map();

function updatechunks()
{

  for(let i = -chunk_width*12; i < chunk_width*12; i+=16)
  {
    for(let k = -chunk_width*12; k < chunk_width*12; k+=16)
    {
      let x = Math.round((i+camera.position.x)/16);
      let z = Math.round((k+camera.position.z)/16);

      if(!mappedChunks.has(""+x+","+z))
      {
        let obj = { x: x, z: z }
        if(!neededChunks.has(""+x+","+z)) // if it needs to tell neededchunks it needs this
        {
          neededChunks.set(""+x+","+z, obj);
        }
      }
    }
  }
}

let chunkLoadTimer = 0;
let chunkLoadInterval = 5;

let chunkSortTimer = 0;
let chunkSortInterval = 8;

function runChunkQueue()
{
  if(neededChunks.size > 2)
  {
    if(chunkLoadTimer > chunkLoadInterval || (new Date().getSeconds() - TimeStartedProgram.getSeconds()) < 10)
    {
      chunkLoadTimer = 0;
      const needed = Array.from(neededChunks.values());
      needed.sort((a,b)=>{  
        let aDistance = Math.sqrt(Math.pow(a.x - camera.position.x, 2) + Math.pow(a.z - camera.position.z, 2));
        let bDistance = Math.sqrt(Math.pow(b.x - camera.position.x, 2) + Math.pow(b.z -camera.position.z, 2));
          if(aDistance > bDistance)
          {
            return 1;
          }
          else if(aDistance < bDistance)
          {
            return -1
          }
          else{
            return 0;
          }  })
      const neededSpot = needed[0];
      if(chunkSortTimer >= chunkSortInterval) {
        sortchunks();
      }
      else{
        chunkSortTimer++;
      }

      let grabbedMesh = chunkpool.pop();
      if(grabbedMesh != null)
      {
        if(mappedChunks.has(""+(<Chunk>grabbedMesh).x+","+(<Chunk>grabbedMesh).z))
        {
          mappedChunks.delete(""+(<Chunk>grabbedMesh).x+","+(<Chunk>grabbedMesh).z)
        }
        scene.remove((<Chunk>grabbedMesh).mesh);
        (<Chunk>grabbedMesh).buildmesh(neededSpot.x, neededSpot.z);
        scene.add((<Chunk>grabbedMesh).mesh);
        chunkpool.unshift(grabbedMesh);
        mappedChunks.set(""+neededSpot.x+","+neededSpot.z, true);
        neededChunks.delete(""+neededSpot.x+","+neededSpot.z)
      }
    }
    else
    {
      chunkLoadTimer++;
    }
  }
}

function sortchunks()
{
  //furthest away go to the back, to be popped for reuse
  chunkpool.sort((a,b)=>{ 
    if((<Chunk>a).vertices.length < 10)
    {
      return 1;
    }
    let aDistance = Math.sqrt(Math.pow(camera.position.x - (<Chunk>a).x, 2) + Math.pow(camera.position.z - (<Chunk>a).z, 2));
    let bDistance = Math.sqrt(Math.pow(camera.position.x-(<Chunk>b).x, 2) + Math.pow(camera.position.z-(<Chunk>b).z, 2));
    if(aDistance > bDistance)
    {
      return 1;
    }
    else if(aDistance < bDistance)
    {
      return -1
    }
    else{
      return 0;
    }
  })
}

//INITIALIZE CHUNKS FOR WORLD
for(let i = 0; i < 32; i++)
{
  for(let k = 0; k < 32; k++)
  {
    let testChunk = new Chunk();
    testChunk.mesh.frustumCulled = false;
    (<Array<Chunk>>chunkpool).push(testChunk);
    scene.add(testChunk.mesh);
  }
}

const onKeyDown = function (event) {
  switch (event.code) {
    case 'KeyW':
      input.ActiveState |= InputState.forward;
      break
    case 'KeyA':
      input.ActiveState |= InputState.left;
      break
    case 'KeyS':
      input.ActiveState |= InputState.back;
      break
    case 'KeyD':
      input.ActiveState |= InputState.right;
      break
    case 'Space':
      input.ActiveState |= InputState.up;
      break
    case 'ShiftLeft':
      input.ActiveState |= InputState.down;
      break
  }
}
document.addEventListener('keydown', onKeyDown, false)

const onKeyUp = function (event) {
  switch (event.code) {
    case 'KeyW':
      input.ActiveState ^= InputState.forward;
      break
    case 'KeyA':
      input.ActiveState ^= InputState.left;
      break
    case 'KeyS':
      input.ActiveState ^= InputState.back;
      break
    case 'KeyD':
      input.ActiveState ^= InputState.right;
      break
    case 'Space':
      input.ActiveState ^= InputState.up;
      break
    case 'ShiftLeft':
      input.ActiveState ^= InputState.down;
      break
  }
}
document.addEventListener('keyup', onKeyUp, false)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: <HTMLCanvasElement | OffscreenCanvas | undefined>canvas, // Canvas is the canvas element from html
  alpha: true
});
renderer.setClearColor(backfogcolor, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Avoid pixelation on high res screens

// Animate
const animate = () => {
  // // Update the controls
  if(input.ActiveState & InputState.forward)
  {
    controls.moveForward(0.25);
  }
  if(input.ActiveState & InputState.back)
  {
    controls.moveForward(-0.25);
  }
  if(input.ActiveState & InputState.right)
  {
    controls.moveRight(0.25);
  }
  if(input.ActiveState & InputState.left)
  {
    controls.moveRight(-0.25);
  }
  if(input.ActiveState & InputState.up)
  {
    camera.position.y += 0.2;
  }
  if(input.ActiveState & InputState.down)
  {
    camera.position.y -= 0.2;
  }

  updatechunks();
  runChunkQueue();
  //Render the scene
  renderer.render(scene, camera);

  //Calls itself next frame, to repeat
  window.requestAnimationFrame(animate);
};
animate();