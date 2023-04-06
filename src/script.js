import "./style.css";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class InputHandler
{
  constructor()
  {
    this.left = false;
    this.right = false;
    this.forward = false;
    this.back = false;
    this.up = false;
    this.down = false;
  }
}

class World
{
  constructor()
  {
    this.data = new Map();
  }
  generate()
  {
    for(let j = 0; j < 20; j++)
    {
      for(let i = -1000; i < 1000; i++)
      {
        for(let k = -1000; k < 1000; k++)
        {
          if(Math.random()*10 < 1) { this.data.set(i+','+j+','+k, Number.parseInt(1)) } 
        }
      }
    } 
  }
}

let world = new World();
world.generate();
let myInput = new InputHandler();


// Canvas
const canvas = document.querySelector("canvas");

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

const pointLight = new THREE.PointLight(0xffffff, 10); // Create a point light
pointLight.position.set(-10, 50, 0);
scene.add(pointLight);

// Controls
const controls = new PointerLockControls(camera, canvas);
controls.enableDamping = false; // use to give a sense of weight
controls.constrainVertical = true;
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
const meshMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000,
depthWrite:true } );

class Chunk
{
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
    let newVerts = [];
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
      if(Math.sqrt(Math.pow(camera.position.x-neededSpot.x, 2) + Math.pow(camera.position.z - neededSpot.z, 2)) < chunk_width*7)
      {
        //throw this one out
        //console.log("threw one out");
        //neededChunks.delete(""+neededSpot.x+","+neededSpot.z)
      }
      //else
      {
      sortchunks();
      let grabbedMesh = chunkpool.pop();
        if(mappedChunks.has(""+grabbedMesh.x+","+grabbedMesh.z))
        {
          mappedChunks.delete(""+grabbedMesh.x+","+grabbedMesh.z)
        }
        


        scene.remove(grabbedMesh.mesh);
        grabbedMesh.buildmesh(neededSpot.x, neededSpot.z);

        scene.add(grabbedMesh.mesh);
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
    if(a.vertices.size < 10)
    {
      return 1;
    }
    let aDistance = Math.sqrt(Math.pow(camera.position.x - a.x, 2) + Math.pow(camera.position.z - a.z, 2));
    let bDistance = Math.sqrt(Math.pow(camera.position.x-b.x, 2) + Math.pow(camera.position.z-b.z, 2));
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
    chunkpool.push(testChunk);
    scene.add(testChunk.mesh);
  }
}




const gltfLoader = new GLTFLoader(); // Create a loader
let sun;

// make async loader
const loadAsync = url => {
  return new Promise(resolve => {
    gltfLoader.load(url, gltf => {
      resolve(gltf)
    })
  })
}
Promise.all( [loadAsync('./sun/scene.gltf'), loadAsync('./jellyfish/scene.gltf')] ).then(models => {
  // get what you need from the models array
  const sun = models[0].scene.children[0]
    sun.position.set(-15, 0, 0);
    sun.scale.set(0.1, 0.1, 0.1);
  const jf = models[1].scene.children[0]
    jf.position.set(5, 0, 0);
    jf.scale.set(0.01, 0.01, 0.01);

    console.log("sun", sun);
  // add both models to the scene

  scene.add(sun)
  scene.add(jf)
})

const onKeyDown = function (event) {
  switch (event.code) {
      case 'KeyW':
          myInput.forward = true;
          break
      case 'KeyA':
          myInput.left = true;
          break
      case 'KeyS':
          myInput.back = true;
          break
      case 'KeyD':
          myInput.right = true;
          break
      case 'Space':
          myInput.up = true;
          break
      case 'ShiftLeft':
          myInput.down = true;
          break
  }
}
document.addEventListener('keydown', onKeyDown, false)

const onKeyUp = function (event) {
  switch (event.code) {
      case 'KeyW':
          myInput.forward = false;
          break
      case 'KeyA':
          myInput.left = false;
          break
      case 'KeyS':
          myInput.back = false;
          break
      case 'KeyD':
          myInput.right = false;
          break
      case 'Space':
          myInput.up = false;
          break
      case 'ShiftLeft':
          myInput.down = false;
          break
  }
}
document.addEventListener('keyup', onKeyUp, false)
// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas, // Canvas is the canvas element from html
  alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Avoid pixelation on high res screens

// Animate
const animate = () => {
    // // Update the controls
    if(myInput.forward)
    {
      controls.moveForward(0.25);
    }
    if(myInput.back)
    {
      controls.moveForward(-0.25);
    }
    if(myInput.right)
    {
      controls.moveRight(0.25);
    }
    if(myInput.left)
    {
      controls.moveRight(-0.25);
    }
    if(myInput.up)
    {
      camera.position.y += 0.2;
    }
    if(myInput.down)
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

