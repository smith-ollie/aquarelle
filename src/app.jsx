import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import fragmentFBO from "./fbo.glsl";
import vertex from "./vertex.glsl";
import { useFBO } from "@react-three/drei";

const colours = ["264653", "2a9d8f", "e9c46a", "f4a261", "e76f51"];

/* CSS HEX */
// --charcoal: #264653;
// --persian-green: #2a9d8f;
// --saffron: #e9c46a;
// --sandy-brown: #f4a261;
// --burnt-sienna: #e76f51;

// Create a ColorBox component that takes a color and position as props
function ColorBox({ color, position, renderOrder }) {
  return (
    <mesh position={position} renderOrder={renderOrder}>
      <boxGeometry args={[1, 1, 0.1]} />
      <meshBasicMaterial
        color={`#${color}`}
        transparent={true}
        opacity={0.7}
        depthWrite={false}
        depthTest={false}
        blending={THREE.NormalBlending}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.OneMinusSrcAlphaFactor}
        blendEquation={THREE.SubtractEquation}
      />
    </mesh>
  );
}

// Replace individual box components with ColorBoxes generated from the array
function ColorBoxes() {
  return (
    <>
      {colours.map((color, index) => {
        // Calculate position - move boxes horizontally with a slight overlap
        const xOffset = index * 0.3 - (colours.length * 0.3) / 2;
        return (
          <ColorBox
            key={index}
            color={color}
            position={[xOffset, 0, 0]}
            renderOrder={colours.length - index} // Higher render order for later boxes
          />
        );
      })}
    </>
  );
}

// Component to handle the FBO Ping Pong logic and display
function FboPingPongEffect({ renderSourceScene = true, onDebugTexturesReady }) {
  const { gl, size, scene: mainScene, camera: mainCamera } = useThree();
  const time = useRef(0);
  const frameCount = useRef(0);

  // Create a final scene and camera like in the imperative version
  const finalScene = useMemo(() => {
    const scene = new THREE.Scene();
    return scene;
  }, []);

  const finalCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    []
  );

  // FBO setup using drei's useFBO
  const fboSettings = useMemo(() => ({}), []);
  const targetA = useFBO(fboSettings);
  const targetB = useFBO(fboSettings);
  const sourceTarget = useFBO({ ...fboSettings });

  // Ref to manage ping-pong state
  const pingPong = useRef({ read: targetA, write: targetB });

  // Material for the FBO computation quad
  const fboMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: sourceTarget.texture },
          tPrev: { value: targetA.texture },
          time: { value: 0 },
          resolution: {
            value: new THREE.Vector4(
              size.width,
              size.height,
              1 / size.width,
              1 / size.height
            ),
          },
        },
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        vertexShader: vertex,
        fragmentShader: fragmentFBO,
      }),
    [size, sourceTarget.texture, targetA.texture]
  );

  // FBO rendering utilities
  const fboCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    []
  );

  const fboScene = useMemo(() => {
    const scene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fboMaterial);
    scene.add(quad);
    return scene;
  }, [fboMaterial]);

  // Fix: Create a transparent texture for initialization
  const transparentTexture = useMemo(() => {
    const data = new Uint8Array([
      255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0,
    ]);
    const texture = new THREE.DataTexture(data, 2, 2, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Initial texture setup - use transparency
  useEffect(() => {
    console.log("Initializing transparent textures");

    const tempScene = new THREE.Scene();
    const tempCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const tempMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
    });

    const tempQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), tempMat);
    tempScene.add(tempQuad);

    const currentRenderTarget = gl.getRenderTarget();
    const currentClearColor = new THREE.Color();
    gl.getClearColor(currentClearColor);
    const currentClearAlpha = gl.getClearAlpha();

    gl.setClearColor(1.0, 1.0, 1.0, 1.0);

    gl.setRenderTarget(targetA);
    gl.clear();
    gl.render(tempScene, tempCam);

    gl.setRenderTarget(targetB);
    gl.clear();
    gl.render(tempScene, tempCam);

    fboMaterial.uniforms.tPrev.value = transparentTexture;

    gl.setClearColor(currentClearColor, currentClearAlpha);
    gl.setRenderTarget(currentRenderTarget);

    tempMat.dispose();
    tempQuad.geometry.dispose();
  }, [gl, targetA, targetB, fboMaterial, transparentTexture]);

  const displayMeshRef = useRef();
  const finalQuadRef = useRef();

  useEffect(() => {
    if (!finalQuadRef.current) {
      const finalQuad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({
          transparent: true,
          blending: THREE.CustomBlending,
          blendSrc: THREE.SrcAlphaFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
          blendEquation: THREE.AddEquation,
        })
      );
      finalScene.add(finalQuad);
      finalQuadRef.current = finalQuad;

      console.log("Initial transparent quad created");
    }

    return () => {
      if (finalQuadRef.current) {
        finalScene.remove(finalQuadRef.current);
        finalQuadRef.current.geometry.dispose();
        finalQuadRef.current.material.dispose();
      }
    };
  }, [finalScene, finalCamera, gl, transparentTexture]);

  useFrame((state, delta) => {
    frameCount.current++;
    time.current += delta;

    console.log("Frame rendering", frameCount.current);

    gl.setClearColor(1.0, 1.0, 1.0, 1.0);
    gl.setRenderTarget(sourceTarget);
    gl.clear();
    gl.render(mainScene, mainCamera);

    if (frameCount.current === 1) {
      gl.setRenderTarget(null);
      gl.render(mainScene, mainCamera);
      console.log("Rendered main scene directly once");
      return;
    }

    gl.setRenderTarget(pingPong.current.read);
    gl.clear();
    gl.render(fboScene, fboCamera);

    fboMaterial.uniforms.tDiffuse.value = sourceTarget.texture;
    fboMaterial.uniforms.tPrev.value = pingPong.current.read.texture;
    fboMaterial.uniforms.time.value = time.current;

    if (finalQuadRef.current) {
      finalQuadRef.current.material.map = pingPong.current.read.texture;
      finalQuadRef.current.material.transparent = true;
      finalQuadRef.current.material.needsUpdate = true;

      console.log(
        "Final quad updated with texture:",
        pingPong.current.read.texture ? "yes" : "no"
      );
    }

    gl.setRenderTarget(null);
    gl.render(finalScene, finalCamera);

    const temp = pingPong.current.read;
    pingPong.current.read = pingPong.current.write;
    pingPong.current.write = temp;
  }, 1);

  return (
    <mesh position={[0, 0, 0]} renderOrder={10}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial color="yellow" />
    </mesh>
  );
}

function App() {
  const [showDebug, setShowDebug] = useState(true);
  const [fboTextures, setFboTextures] = useState([]);

  return (
    <div
      id="container"
      style={{ width: "100vw", height: "100vh", background: "white" }}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 70, near: 0.1, far: 1000 }}
        flat
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(1.0, 1.0, 1.0, 1.0);
          console.log("Canvas created with transparent background");
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Replace individual boxes with ColorBoxes component */}
        <ColorBoxes />

        <FboPingPongEffect
          renderSourceScene={true}
          onDebugTexturesReady={setFboTextures}
        />
      </Canvas>
    </div>
  );
}

export default App;
