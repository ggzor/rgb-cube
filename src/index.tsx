import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { useRef } from "react";

import "./index.css";
import { Object3D } from "three";

const STEP_BETWEEN_CUBES = 6;

function App() {
  const cubes = useMemo(() => generateCubes(STEP_BETWEEN_CUBES), []);
  return (
    <Canvas
      camera={{ position: [400, 400, 400], far: 4000 }}
      onCreated={(state) => state.gl.setClearColor("black")}
      flat={true}
      frameloop="demand"
    >
      <Cubes cubes={cubes} />
      <OrbitControls target={[128, 128, 128]} />
    </Canvas>
  );
}

type Vec3 = [x: number, y: number, z: number];

function generateCubes(step: number): Vec3[] {
  const cubes = [];

  for (let x = 0; x < 256; x += step) {
    for (let y = 0; y < 256; y += step) {
      for (let z = 0; z < 256; z += step) {
        cubes.push([x, y, z] as Vec3);
      }
    }
  }

  return cubes;
}

function generateColorBuffer(cubes: Vec3[]) {
  const color = new THREE.Color();
  return new Float32Array(
    cubes.flatMap(([r, g, b]) => {
      color.set(`rgb(${r}, ${g}, ${b})`);
      return color.toArray();
    })
  );
}

function Cubes({ cubes }: { cubes: Vec3[] }) {
  const colorBuffer = useMemo(() => generateColorBuffer(cubes), [cubes]);
  const mesh = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const tempObject = new Object3D();
    cubes.forEach((v, i) => {
      tempObject.position.set(...v);
      tempObject.updateMatrix();
      mesh.current.setMatrixAt(i, tempObject.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  }, [cubes]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, cubes.length]}>
      <boxGeometry>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorBuffer, 3]}
        />
      </boxGeometry>
      <meshBasicMaterial vertexColors={true} />
    </instancedMesh>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
