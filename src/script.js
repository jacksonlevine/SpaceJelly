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
const ambientLight = new THREE.AmbientLight(0xffffff, 2);  // Create a basic white universal light  // TODO: Change this to a fancier light!
ambientLight.position.set(0, 0, 0); // Set position of the light
scene.add(ambientLight); 

const pointLight = new THREE.PointLight(0xffffff, 2); // Create a point light
pointLight.position.set(0, 0, 0);
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

// Particles
const meshGeometry = new THREE.BufferGeometry(); // Geometry for stars

const vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,

	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0, -1.0,  1.0
] );

meshGeometry.setAttribute(
  "position", 
  new THREE.BufferAttribute(vertices, 3) // stores data ie. vertices position, custom attributes// 3 vals [xyz] per docs
)

// Texture (loader fxn)
//const textureLoader = new THREE.TextureLoader();
//const particleTexture = textureLoader.load("/textures/particles/bubble.png"); // TODO // Adds particle textures

// Material
const meshMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

const mesh = new THREE.Mesh(meshGeometry, meshMaterial );
scene.add(mesh);

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


    //Render the scene
    renderer.render(scene, camera);

    //Calls itself next frame, to repeat
    window.requestAnimationFrame(animate);
};

animate();

