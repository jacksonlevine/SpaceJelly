import "./style.css";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import ImprovedNoise from "./perlin.js";

let start = new Date();
const TimeStartedProgram = start.getUTCSeconds();

let chunk_width = 16;

class InputState {
  constructor()
  {
    this.left = false;
    this.right = false;
    this.back = false;
    this.forward = false;
    this.up = false;
    this.down = false;
  }
  
}

class InputHandler {
  constructor()
  {
    this.ActiveState = new InputState();
  }
}

class World {

  constructor() {
    this.data = new Map();
    this.hasblockmarks = new Map();
    this.fullblockmarks = new Map();
  }
  generate = () => {
    let REAL_WORLD_X;
    let REAL_WORLD_Y;
    let REAL_WORLD_Z;

    for (let j = -2; j < 2; j++) {
      for (let i = -20; i < 20; i++) {
        for (let k = -20; k < 20; k++) {
          let blockCount = 0;
          for (var o = 0; o < chunk_width; o++) {
            for (var o2 = 0; o2 < chunk_width; o2++) {
              for (var o3 = 0; o3 < chunk_width; o3++) {
                REAL_WORLD_X = i * chunk_width + o;
                REAL_WORLD_Z = k * chunk_width + o3;
                REAL_WORLD_Y = j * chunk_width + o2;

                let n =
                  ImprovedNoise.noise(
                    REAL_WORLD_X / 25.34,
                    34.425,
                    REAL_WORLD_Z / 25.65
                  ) * 15;

                if (REAL_WORLD_Y < n) {
                  blockCount++;
                  if (!this.hasblockmarks.has("" + i + "," + j + "," + k)) {
                    this.hasblockmarks.set("" + i + "," + j + "," + k, "1"); //Chunk level (zoomed out)
                  }
                  if (blockCount >= chunk_width * chunk_width * chunk_width) {
                    this.fullblockmarks.set("" + i + "," + j + "," + k, "1"); // Remove it if its full for now
                  }
                  this.data.set(
                    "" + REAL_WORLD_X + "," + REAL_WORLD_Y + "," + REAL_WORLD_Z,
                    "1"
                  ); // Real world level (micro)
                }
              }
            }
          }
        }
      }
    }
    console.log("Done generating world.");
  };
}

let world = new World();
world.generate();

let input = new InputHandler();

// Canvas
const canvas = document.querySelector("canvas");

const backfogcolor = 0xcccccc;

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(backfogcolor, 10, 200);
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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Create a basic white universal light  // TODO: Change this to a fancier light!
ambientLight.position.set(0, 0, 0); // Set position of the light
scene.add(ambientLight);

const pointLight = new THREE.DirectionalLight(0xffffff, 0.5); // Create a point light
pointLight.position.set(0, 50, 0);
scene.add(pointLight);

// Controls
const controls = new PointerLockControls(
  camera,
  canvas
);
// controls.enableDamping = false; // use to give a sense of weight
// controls.constrainVertical = true;
addEventListener(
  "click",
  function () {
    controls.lock();
  },
  false
);

// Material
const meshMaterial = new THREE.MeshLambertMaterial({
  color: 0xff0000,
  depthWrite: true,
});

class Chunk {

  constructor() {
    this.meshGeometry = new THREE.BufferGeometry();
    this.vertices = new Float32Array(3);
    this.mesh = new THREE.Mesh(this.meshGeometry, meshMaterial);
    this.x = 0; //multiply x and z by 16 to get real-world position
    this.z = 0;
    this.y = 0;
  }
  buildmesh(newx, newy, newz) {
    this.x = newx;
    this.z = newz;
    this.y = newy;
    let newVerts = new Array();
    let newNorms = new Array();
    if (world.fullblockmarks.has("" + this.x + "," + this.y + "," + this.z)) {
      if (
        !world.fullblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        ) ||
        !world.hasblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        )
      ) {
        //left
        newVerts.push(0, 0, 0);
        newVerts.push(0, 0, chunk_width);
        newVerts.push(0, chunk_width, chunk_width);
        newVerts.push(0, chunk_width, chunk_width);
        newVerts.push(0, chunk_width, 0);
        newVerts.push(0, 0, 0);
        for (let h = 0; h < 6; h++) {
          newNorms.push(-1, 0, 0);
        }
      }
      if (
        !world.fullblockmarks.has(
          "" + this.x + "," + this.y + "," + (this.z - 1)
        ) ||
        !world.hasblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        )
      ) {
        //front
        newVerts.push(0, 0, 0);
        newVerts.push(0, chunk_width, 0);
        newVerts.push(chunk_width, chunk_width, 0);
        newVerts.push(chunk_width, chunk_width, 0);
        newVerts.push(chunk_width, 0, 0);
        newVerts.push(0, 0, 0);
        for (let h = 0; h < 6; h++) {
          newNorms.push(0, 0, -1);
        }
      }
      if (
        !world.fullblockmarks.has(
          "" + (this.x + 1) + "," + this.y + "," + this.z
        ) ||
        !world.hasblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        )
      ) {
        //right
        newVerts.push(chunk_width, 0, 0);
        newVerts.push(chunk_width, chunk_width, 0);
        newVerts.push(chunk_width, chunk_width, chunk_width);
        newVerts.push(chunk_width, chunk_width, chunk_width);
        newVerts.push(chunk_width, 0, chunk_width);
        newVerts.push(chunk_width, 0, 0);
        for (let h = 0; h < 6; h++) {
          newNorms.push(1, 0, 0);
        }
      }
      if (
        !world.fullblockmarks.has(
          "" + this.x + "," + this.y + "," + this.z + 1
        ) ||
        !world.hasblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        )
      ) {
        //back
        newVerts.push(chunk_width, 0, chunk_width);
        newVerts.push(chunk_width, chunk_width, chunk_width);
        newVerts.push(0, chunk_width, chunk_width);
        newVerts.push(0, chunk_width, chunk_width);
        newVerts.push(0, 0, chunk_width);
        newVerts.push(chunk_width, 0, chunk_width);
        for (let h = 0; h < 6; h++) {
          newNorms.push(0, 0, 1);
        }
      }
      if (
        !world.fullblockmarks.has(
          "" + this.x + "," + (this.y - 1) + "," + this.z
        ) ||
        !world.hasblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        )
      ) {
        //bottom
        newVerts.push(0, 0, chunk_width);
        newVerts.push(0, 0, 0);
        newVerts.push(chunk_width, 0, 0);
        newVerts.push(chunk_width, 0, 0);
        newVerts.push(chunk_width, 0, chunk_width);
        newVerts.push(0, 0, chunk_width);
        for (let h = 0; h < 6; h++) {
          newNorms.push(0, -1, 0);
        }
      }
      if (
        !world.fullblockmarks.has(
          "" + this.x + "," + (this.y + 1) + "," + this.z
        ) ||
        !world.hasblockmarks.has(
          "" + (this.x - 1) + "," + this.y + "," + this.z
        )
      ) {
        //top
        newVerts.push(0, chunk_width, 0);
        newVerts.push(0, chunk_width, chunk_width);
        newVerts.push(chunk_width, chunk_width, chunk_width);
        newVerts.push(chunk_width, chunk_width, chunk_width);
        newVerts.push(chunk_width, chunk_width, 0);
        newVerts.push(0, chunk_width, 0);
        for (let h = 0; h < 6; h++) {
          newNorms.push(0, 1, 0);
        }
      }
    } else {
      for (let j = 0; j < chunk_width; j++) {
        for (let i = 0; i < chunk_width; i++) {
          for (let k = 0; k < chunk_width; k++) {
            if (
              world.data.has(
                "" +
                  (this.x * 16 + i) +
                  "," +
                  (this.y * 16 + j) +
                  "," +
                  (this.z * 16 + k)
              )
            ) {
              if (
                !world.data.has(
                  "" +
                    (this.x * 16 + i - 1) +
                    "," +
                    (this.y * 16 + j) +
                    "," +
                    (this.z * 16 + k)
                )
              ) {
                newVerts.push(i, j, k);
                newVerts.push(i, j, k + 1);
                newVerts.push(i, j + 1, k + 1);
                newVerts.push(i, j + 1, k + 1);
                newVerts.push(i, j + 1, k);
                newVerts.push(i, j, k);
                for (let h = 0; h < 6; h++) {
                  newNorms.push(-1, 0, 0);
                }
              }
              if (
                !world.data.has(
                  "" +
                    (this.x * 16 + i) +
                    "," +
                    (this.y * 16 + j) +
                    "," +
                    (this.z * 16 + k - 1)
                )
              ) {
                newVerts.push(i, j, k);
                newVerts.push(i, j + 1, k);
                newVerts.push(i + 1, j + 1, k);
                newVerts.push(i + 1, j + 1, k);
                newVerts.push(i + 1, j, k);
                newVerts.push(i, j, k);
                for (let h = 0; h < 6; h++) {
                  newNorms.push(0, 0, -1);
                }
              }
              if (
                !world.data.has(
                  "" +
                    (this.x * 16 + i + 1) +
                    "," +
                    (this.y * 16 + j) +
                    "," +
                    (this.z * 16 + k)
                )
              ) {
                newVerts.push(i + 1, j, k);
                newVerts.push(i + 1, j + 1, k);
                newVerts.push(i + 1, j + 1, k + 1);
                newVerts.push(i + 1, j + 1, k + 1);
                newVerts.push(i + 1, j, k + 1);
                newVerts.push(i + 1, j, k);
                for (let h = 0; h < 6; h++) {
                  newNorms.push(1, 0, 0);
                }
              }
              if (
                !world.data.has(
                  "" +
                    (this.x * 16 + i) +
                    "," +
                    (this.y * 16 + j) +
                    "," +
                    (this.z * 16 + k + 1)
                )
              ) {
                newVerts.push(i, j, k + 1);
                newVerts.push(i + 1, j, k + 1);
                newVerts.push(i + 1, j + 1, k + 1);
                newVerts.push(i + 1, j + 1, k + 1);
                newVerts.push(i, j + 1, k + 1);
                newVerts.push(i, j, k + 1);
                for (let h = 0; h < 6; h++) {
                  newNorms.push(0, 0, 1);
                }
              }
              if (
                !world.data.has(
                  "" +
                    (this.x * 16 + i) +
                    "," +
                    (this.y * 16 + j - 1) +
                    "," +
                    (this.z * 16 + k)
                )
              ) {
                newVerts.push(i, j, k);
                newVerts.push(i + 1, j, k);
                newVerts.push(i + 1, j, k + 1);
                newVerts.push(i + 1, j, k + 1);
                newVerts.push(i, j, k + 1);
                newVerts.push(i, j, k);
                for (let h = 0; h < 6; h++) {
                  newNorms.push(0, -1, 0);
                }
              }
              if (
                !world.data.has(
                  "" +
                    (this.x * 16 + i) +
                    "," +
                    (this.y * 16 + j + 1) +
                    "," +
                    (this.z * 16 + k)
                )
              ) {
                newVerts.push(i, j + 1, k);
                newVerts.push(i, j + 1, k + 1);
                newVerts.push(i + 1, j + 1, k + 1);
                newVerts.push(i + 1, j + 1, k + 1);
                newVerts.push(i + 1, j + 1, k);
                newVerts.push(i, j + 1, k);
                for (let h = 0; h < 6; h++) {
                  newNorms.push(0, 1, 0);
                }
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
    );
    this.meshGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(newNorms), 3)
    );
    this.mesh.position.set(this.x * 16, this.y * 16, this.z * 16);

    this.mesh.geometry = this.meshGeometry;
  }
}

let chunkpool = [];
let mappedChunks = new Map();
let neededChunks = new Map();

let mapTimer = 0;
let mapInterval = 20;

function updatechunks() {
  for (let y = -chunk_width * 2; y < chunk_width * 8; y += 16) {
    for (let i = -chunk_width * 10; i < chunk_width * 10; i += 16) {
      for (let k = -chunk_width * 10; k < chunk_width * 10; k += 16) {
        let x = Math.round((i + camera.position.x) / 16);
        let z = Math.round((k + camera.position.z) / 16);
        let yy = Math.round((y + camera.position.y) / 16);

        if (
          world.hasblockmarks.has("" + x + "," + yy + "," + z) &&
          !mappedChunks.has("" + x + "," + yy + "," + z)
        ) {
          let obj = { x: x, y: yy, z: z };

          if (!neededChunks.has("" + x + "," + yy + "," + z)) {
            // if it needs to tell neededchunks it needs this
            neededChunks.set("" + x + "," + yy + "," + z, obj);
          }
        }
      }
    }
  }
}

let chunkLoadTimer = 0;
let chunkLoadInterval = 0;

function runChunkQueue() {
  if (chunkLoadTimer > chunkLoadInterval && neededChunks.size != 0) {
    chunkLoadTimer = 0;
    const needed = Array.from(neededChunks.values());

    const neededSpot = needed[0];

    let grabbedMesh = chunkpool.pop();
    if (grabbedMesh != null) {
      if (
        mappedChunks.has(
          "" +
            (grabbedMesh).x +
            "," +
            (grabbedMesh).y +
            "," +
            (grabbedMesh).z
        )
      ) {
        mappedChunks.delete(
          "" +
            (grabbedMesh).x +
            "," +
            (grabbedMesh).y +
            "," +
            (grabbedMesh).z
        );
      }
      scene.remove((grabbedMesh).mesh);
      (grabbedMesh).buildmesh(neededSpot.x, neededSpot.y, neededSpot.z);
      scene.add((grabbedMesh).mesh);
      chunkpool.unshift(grabbedMesh);
      mappedChunks.set(
        "" + neededSpot.x + "," + neededSpot.y + "," + neededSpot.z,
        true
      );
      neededChunks.delete(
        "" + neededSpot.x + "," + neededSpot.y + "," + neededSpot.z
      );
    }
  } else {
    chunkLoadTimer++;
  }
}

//INITIALIZE CHUNKS FOR WORLD
for (let i = 0; i < 16; i++) {
  for (let k = 0; k < 16; k++) {
    for (let a = 0; a < 16; a++) {
      let testChunk = new Chunk();
      testChunk.mesh.frustumCulled = false;
      chunkpool.push(testChunk);
      scene.add(testChunk.mesh);
    }
  }
}

const onKeyDown = function (event) {
  switch (event.code) {
    case "KeyW":
      input.ActiveState.forward = true;
      break;
    case "KeyA":
      input.ActiveState.left = true;
      break;
    case "KeyS":
      input.ActiveState.back = true;
      break;
    case "KeyD":
      input.ActiveState.right = true;
      break;
    case "Space":
      input.ActiveState.up = true;
      break;
    case "ShiftLeft":
      input.ActiveState.down = true;
      break;
  }
};
document.addEventListener("keydown", onKeyDown, false);

const onKeyUp = function (event) {
  switch (event.code) {
    case "KeyW":
      input.ActiveState.forward = false;
      break;
    case "KeyA":
      input.ActiveState.left = false;
      break;
    case "KeyS":
      input.ActiveState.back = false;
      break;
    case "KeyD":
      input.ActiveState.right = false;
      break;
    case "Space":
      input.ActiveState.up = false;
      break;
    case "ShiftLeft":
      input.ActiveState.down = false;
      break;
  }
};
document.addEventListener("keyup", onKeyUp, false);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas, // Canvas is the canvas element from html
  alpha: true,
});
renderer.setClearColor(backfogcolor, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Avoid pixelation on high res screens

// Animate
const animate = () => {
  // // Update the controls
  if (input.ActiveState.forward) {
    controls.moveForward(0.25);
  }
  if (input.ActiveState.back) {
    controls.moveForward(-0.25);
  }
  if (input.ActiveState.right) {
    controls.moveRight(0.25);
  }
  if (input.ActiveState.left) {
    controls.moveRight(-0.25);
  }
  if (input.ActiveState.up) {
    camera.position.y += 0.2;
  }
  if (input.ActiveState.down) {
    camera.position.y -= 0.2;
  }
  if (mapTimer >= mapInterval) {
    mapTimer = 0;
    updatechunks();
  } else {
    mapTimer++;
  }

  runChunkQueue();
  //Render the scene
  renderer.render(scene, camera);

  //Calls itself next frame, to repeat
  window.requestAnimationFrame(animate);
};
animate();
