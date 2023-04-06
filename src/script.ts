import "./style.css";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import ImprovedNoise from "./perlin.js";

type uint8 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254;

enum InputState
{
  left,
  right,
  back,
  forward,
  up,
  down
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
  data: Map<string, uint8>
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
          if(ImprovedNoise.noise(j/25, i/25, k/25) > 0.2) { this.data.set(i+','+j+','+k, 1) } 
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

// Scene
const scene = new THREE.Scene();

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
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j)+","+((this.z*16)+k-1)))
            {
              newVerts.push(i, j, k);
              newVerts.push(i, j+1, k);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i+1, j, k);
              newVerts.push(i, j, k);
            }
            if(!world.data.has(""+((this.x*16)+i+1)+","+(j)+","+((this.z*16)+k)))
            {
              newVerts.push(i+1, j, k);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i+1, j, k);
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j)+","+((this.z*16)+k+1)))
            {
              newVerts.push(i, j, k+1);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i, j+1, k+1);
              newVerts.push(i, j, k+1);
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j-1)+","+((this.z*16)+k)))
            {
              newVerts.push(i, j, k);
              newVerts.push(i+1, j, k);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i+1, j, k+1);
              newVerts.push(i, j, k+1);
              newVerts.push(i, j, k);
            }
            if(!world.data.has(""+((this.x*16)+i)+","+(j+1)+","+((this.z*16)+k)))
            {
              newVerts.push(i, j+1, k);
              newVerts.push(i, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k+1);
              newVerts.push(i+1, j+1, k);
              newVerts.push(i, j+1, k);
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
    this.mesh.position.set(this.x*16, 0, this.z*16);
    this.meshGeometry.computeVertexNormals();
    this.meshGeometry.computeBoundingBox();

    this.meshGeometry.normalizeNormals();
    this.mesh.geometry =this.meshGeometry;
  }
}

let chunkpool = [];
let mappedChunks = new Map();
let neededChunks = new Map();

function updatechunks()
{

  for(let i = -6; i < 6; i++)
  {
    for(let k = -6; k < 6; k++)
    {
      let x = i+Math.round(camera.position.x/16);
      let z = k+Math.round(camera.position.z/16);

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

function runChunkQueue()
{
  if(neededChunks.size > 2)
  {
    if(chunkLoadTimer > chunkLoadInterval)
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
      if(Math.sqrt(Math.pow(camera.position.x-neededSpot.x, 2) + Math.pow(camera.position.z - neededSpot.z, 2)) > chunk_width*7)
      {
        //throw this one out
        //console.log("threw one out");
        neededChunks.delete(""+neededSpot.x+","+neededSpot.z)
      }
      else
      {
        sortchunks();
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
for(let i = 0; i < 16; i++)
{
  for(let k = 0; k < 16; k++)
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