"use client";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";

export type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  size: number;
  pattern: number;
  phase: number;
  wobble: number;
  mouthOpen: number;
  feeding: number;
  seekingFood: boolean;
  visibility: number;
  depthProgress: number;
};

type FishRef = { current: Fish[] };

type FishAssets = {
  body: THREE.ShapeGeometry;
  bodyOutline: THREE.BufferGeometry;
  tail: THREE.ShapeGeometry;
  tailOutline: THREE.BufferGeometry;
  tailRibs: THREE.BufferGeometry;
  dorsalFin: THREE.ShapeGeometry;
  dorsalOutline: THREE.BufferGeometry;
  dorsalRibs: THREE.BufferGeometry;
  ventralFin: THREE.ShapeGeometry;
  ventralOutline: THREE.BufferGeometry;
  ventralRibs: THREE.BufferGeometry;
  pectoralFin: THREE.ShapeGeometry;
  pectoralOutline: THREE.BufferGeometry;
  pectoralRibs: THREE.BufferGeometry;
  redMarks: THREE.ShapeGeometry[][];
  blackMarks: THREE.ShapeGeometry[][];
  sphere: THREE.SphereGeometry;
  white: THREE.MeshBasicMaterial;
  fin: THREE.MeshBasicMaterial;
  red: THREE.MeshBasicMaterial;
  black: THREE.MeshBasicMaterial;
  ink: THREE.LineBasicMaterial;
  inkFill: THREE.MeshBasicMaterial;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
};

type Mark = { x: number; z: number; rx: number; rz: number; seed: number };
type Segment = [[number, number], [number, number]];

const FISH_LAYER_SPACING = 4.5;
export const SOLID_RED_PATTERN = 3;

function flatShapeGeometry(shape: THREE.Shape, height: number) {
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, height, 0);
  return geometry;
}

function flatOutlineGeometry(shape: THREE.Shape, height: number) {
  const points = shape.getPoints(32).map(
    ({ x, y }) => new THREE.Vector3(x, height, y),
  );
  return new THREE.BufferGeometry().setFromPoints(points);
}

function segmentGeometry(segments: Segment[], height: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const halfWidth = 0.012;

  segments.forEach(([[x1, z1], [x2, z2]], index) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz) || 1;
    const nx = (-dz / length) * halfWidth;
    const nz = (dx / length) * halfWidth;
    const base = index * 4;
    positions.push(
      x1 + nx, height, z1 + nz,
      x1 - nx, height, z1 - nz,
      x2 - nx, height, z2 - nz,
      x2 + nx, height, z2 + nz,
    );
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

function createBlob({ x, z, rx, rz, seed }: Mark) {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    const variation = 0.82 + Math.sin(index * 2.4 + seed) * 0.16;
    return {
      x: x + Math.cos(angle) * rx * variation,
      y: z + Math.sin(angle) * rz * variation,
    };
  });
  const midpoint = (a: THREE.Vector2, b: THREE.Vector2) =>
    new THREE.Vector2((a.x + b.x) / 2, (a.y + b.y) / 2);
  const vectors = points.map(({ x: pointX, y: pointY }) =>
    new THREE.Vector2(pointX, pointY),
  );
  const shape = new THREE.Shape();
  shape.moveTo(...midpoint(vectors.at(-1)!, vectors[0]).toArray());
  vectors.forEach((point, index) => {
    const next = vectors[(index + 1) % vectors.length];
    shape.quadraticCurveTo(point.x, point.y, ...midpoint(point, next).toArray());
  });
  shape.closePath();
  return shape;
}

function createBodyShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.9, 0);
  shape.quadraticCurveTo(-0.72, -0.12, -0.42, -0.21);
  shape.quadraticCurveTo(0.02, -0.33, 0.43, -0.3);
  shape.quadraticCurveTo(0.82, -0.27, 1.01, -0.12);
  shape.quadraticCurveTo(1.1, -0.04, 1.1, 0.025);
  shape.quadraticCurveTo(1.05, 0.14, 0.83, 0.2);
  shape.quadraticCurveTo(0.45, 0.31, 0.04, 0.28);
  shape.quadraticCurveTo(-0.43, 0.23, -0.73, 0.1);
  shape.quadraticCurveTo(-0.9, 0.045, -0.9, 0);
  shape.closePath();
  return shape;
}

function createFinShape(kind: "tail" | "dorsal" | "ventral" | "pectoral") {
  const shape = new THREE.Shape();

  if (kind === "tail") {
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(-0.08, -0.43, -0.3, -0.64);
    shape.quadraticCurveTo(-0.55, -0.88, -0.75, -0.7);
    shape.quadraticCurveTo(-0.7, -0.42, -0.4, -0.14);
    shape.quadraticCurveTo(-0.31, 0, -0.4, 0.14);
    shape.quadraticCurveTo(-0.7, 0.42, -0.75, 0.7);
    shape.quadraticCurveTo(-0.55, 0.88, -0.3, 0.64);
    shape.quadraticCurveTo(-0.08, 0.43, 0, 0);
  } else if (kind === "dorsal") {
    shape.moveTo(-0.3, 0);
    shape.quadraticCurveTo(-0.18, -0.09, -0.04, -0.075);
    shape.quadraticCurveTo(0.1, -0.09, 0.3, 0);
    shape.quadraticCurveTo(0.1, 0.09, -0.04, 0.075);
    shape.quadraticCurveTo(-0.18, 0.09, -0.3, 0);
  } else if (kind === "ventral") {
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(-0.14, -0.04, -0.25, -0.2);
    shape.quadraticCurveTo(-0.38, -0.39, -0.23, -0.43);
    shape.quadraticCurveTo(0.02, -0.34, 0.18, -0.13);
    shape.quadraticCurveTo(0.1, -0.025, 0, 0);
  } else {
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(-0.25, -0.05, -0.48, -0.27);
    shape.quadraticCurveTo(-0.7, -0.54, -0.52, -0.7);
    shape.quadraticCurveTo(-0.2, -0.67, 0.2, -0.25);
    shape.quadraticCurveTo(0.12, -0.04, 0, 0);
  }

  shape.closePath();
  return shape;
}

function createFishAssets(): FishAssets {
  const geometries: THREE.BufferGeometry[] = [];
  const registerShape = (shape: THREE.Shape, height: number) => {
    const fill = flatShapeGeometry(shape, height);
    const outline = flatOutlineGeometry(shape, height + 0.012);
    geometries.push(fill, outline);
    return { fill, outline };
  };
  const registerSegments = (segments: Segment[], height: number) => {
    const geometry = segmentGeometry(segments, height);
    geometries.push(geometry);
    return geometry;
  };

  const body = registerShape(createBodyShape(), 0);
  const tail = registerShape(createFinShape("tail"), 0.018);
  const dorsal = registerShape(createFinShape("dorsal"), 0.018);
  const ventral = registerShape(createFinShape("ventral"), 0.018);
  const pectoral = registerShape(createFinShape("pectoral"), 0.018);

  const tailRibs = registerSegments([
    [[0, 0], [-0.7, -0.78]],
    [[0, 0], [-0.73, -0.63]],
    [[0, 0], [-0.64, -0.47]],
    [[0, 0], [-0.52, -0.34]],
    [[0, 0], [-0.4, -0.22]],
    [[0, 0], [-0.4, 0.22]],
    [[0, 0], [-0.52, 0.34]],
    [[0, 0], [-0.64, 0.47]],
    [[0, 0], [-0.73, 0.63]],
    [[0, 0], [-0.7, 0.78]],
  ], 0.044);
  const dorsalRibs = registerSegments([
    [[-0.22, 0], [-0.2, -0.055]],
    [[-0.22, 0], [-0.2, 0.055]],
    [[-0.1, 0], [-0.09, -0.07]],
    [[-0.1, 0], [-0.09, 0.07]],
    [[0.02, 0], [0.03, -0.07]],
    [[0.02, 0], [0.03, 0.07]],
    [[0.14, 0], [0.16, -0.055]],
    [[0.14, 0], [0.16, 0.055]],
  ], 0.044);
  const ventralRibs = registerSegments([
    [[0, 0], [-0.31, -0.37]],
    [[-0.06, -0.025], [-0.29, -0.39]],
    [[0.02, -0.035], [-0.2, -0.4]],
    [[0.09, -0.055], [-0.1, -0.34]],
  ], 0.044);
  const pectoralRibs = registerSegments([
    [[0, 0], [-0.65, -0.61]],
    [[-0.1, -0.025], [-0.68, -0.55]],
    [[-0.02, -0.06], [-0.62, -0.62]],
    [[0.07, -0.11], [-0.48, -0.63]],
    [[0.14, -0.16], [-0.32, -0.55]],
    [[0.18, -0.2], [-0.15, -0.43]],
  ], 0.044);

  const redMarkSpecs: Mark[][] = [
    [
      { x: -0.08, z: -0.015, rx: 0.42, rz: 0.205, seed: 1 },
      { x: 0.61, z: 0.005, rx: 0.18, rz: 0.125, seed: 3 },
    ],
    [
      { x: -0.45, z: -0.015, rx: 0.17, rz: 0.14, seed: 2 },
      { x: 0.08, z: 0.01, rx: 0.29, rz: 0.2, seed: 4 },
      { x: 0.62, z: -0.005, rx: 0.18, rz: 0.13, seed: 5 },
    ],
    [
      { x: -0.53, z: -0.08, rx: 0.085, rz: 0.08, seed: 1 },
      { x: -0.28, z: 0.09, rx: 0.075, rz: 0.07, seed: 3 },
      { x: 0.02, z: -0.1, rx: 0.09, rz: 0.08, seed: 6 },
      { x: 0.27, z: 0.08, rx: 0.085, rz: 0.075, seed: 2 },
      { x: 0.55, z: -0.04, rx: 0.07, rz: 0.065, seed: 4 },
    ],
  ];
  const blackMarkSpecs: Mark[][] = [
    [],
    [
      { x: -0.06, z: 0.015, rx: 0.29, rz: 0.2, seed: 2 },
      { x: 0.51, z: -0.025, rx: 0.2, rz: 0.15, seed: 5 },
    ],
    [
      { x: -0.35, z: -0.015, rx: 0.11, rz: 0.08, seed: 3 },
      { x: 0.36, z: 0.005, rx: 0.13, rz: 0.09, seed: 1 },
    ],
  ];
  const createMarks = (specs: Mark[][]) => specs.map((patternMarks) =>
    patternMarks.map((mark) => {
      const { fill } = registerShape(createBlob(mark), 0.032);
      return fill;
    }),
  );
  const redMarks = createMarks(redMarkSpecs);
  const blackMarks = createMarks(blackMarkSpecs);
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  geometries.push(sphere);

  const white = new THREE.MeshBasicMaterial({ color: "#fffdf8", side: THREE.DoubleSide });
  const fin = new THREE.MeshBasicMaterial({ color: "#f3eadb", side: THREE.DoubleSide });
  const red = new THREE.MeshBasicMaterial({ color: "#e1261c", side: THREE.DoubleSide });
  const black = new THREE.MeshBasicMaterial({ color: "#202326", side: THREE.DoubleSide });
  const ink = new THREE.LineBasicMaterial({ color: "#202326", transparent: true, opacity: 0.88 });
  const inkFill = new THREE.MeshBasicMaterial({ color: "#202326", side: THREE.DoubleSide });
  const materials = [white, fin, red, black, ink, inkFill];

  return {
    body: body.fill,
    bodyOutline: body.outline,
    tail: tail.fill,
    tailOutline: tail.outline,
    tailRibs,
    dorsalFin: dorsal.fill,
    dorsalOutline: dorsal.outline,
    dorsalRibs,
    ventralFin: ventral.fill,
    ventralOutline: ventral.outline,
    ventralRibs,
    pectoralFin: pectoral.fill,
    pectoralOutline: pectoral.outline,
    pectoralRibs,
    redMarks,
    blackMarks,
    sphere,
    white,
    fin,
    red,
    black,
    ink,
    inkFill,
    geometries,
    materials,
  };
}

function FishModel({
  fishRef,
  index,
  pattern,
  assets,
}: {
  fishRef: FishRef;
  index: number;
  pattern: number;
  assets: FishAssets;
}) {
  const root = useRef<THREE.Group>(null);
  const heading = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const size = useThree((state) => state.size);
  const isSolidRed = pattern === SOLID_RED_PATTERN;
  const fishPattern = pattern % assets.redMarks.length;
  const materials = useMemo(() => {
    const white = assets.white.clone();
    const fin = assets.fin.clone();
    if (isSolidRed) {
      white.color.set("#ff321f");
      fin.color.set("#ff321f");
    }
    const clonedMaterials = {
      white,
      fin,
      red: assets.red.clone(),
      black: assets.black.clone(),
      ink: assets.ink.clone(),
      inkFill: assets.inkFill.clone(),
    };
    Object.values(clonedMaterials).forEach((material) => {
      material.transparent = true;
    });
    return clonedMaterials;
  }, [assets, isSolidRed]);
  const materialsRef = useRef(materials);

  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
  }, [materials]);

  useFrame((state, delta) => {
    const fish = fishRef.current[index];
    if (!fish || !root.current || !heading.current || !tail.current || !mouth.current) return;

    const bob = Math.sin(state.clock.elapsedTime * 1.2 + fish.phase) * fish.wobble;
    const naturalDepth = (Math.sin(state.clock.elapsedTime * 0.18 + fish.phase) + 1) / 2;
    const targetDepthProgress = fish.seekingFood ? 1 : naturalDepth;
    fish.depthProgress +=
      (targetDepthProgress - fish.depthProgress) * Math.min(1, delta * 0.8);
    const depthProgress = fish.depthProgress;
    const depthVisibility = 0.16 + depthProgress * 0.84;
    const targetVisibility = fish.seekingFood
      ? 1
      : isSolidRed
        ? 0.55 + depthProgress * 0.45
        : depthVisibility;
    fish.visibility += (targetVisibility - fish.visibility) * Math.min(1, delta * 4);
    const visibility = fish.visibility;
    const layer = fishRef.current.reduce(
      (rank, other, otherIndex) =>
        rank + Number(
          other.y < fish.y || (other.y === fish.y && otherIndex < index),
        ),
      0,
    );
    const depthTravel = isSolidRed ? 120 : 36;
    const depth =
      (layer - (fishRef.current.length - 1) / 2) * FISH_LAYER_SPACING +
      (depthProgress - 0.5) * depthTravel;
    root.current.position.set(
      fish.x - size.width / 2,
      depth,
      fish.y - size.height / 2 + bob,
    );
    root.current.scale.setScalar(
      fish.size * (0.55 + depthProgress * 0.45) * (isSolidRed ? 1.35 : 1),
    );
    materialsRef.current.white.opacity = visibility;
    materialsRef.current.fin.opacity = visibility;
    materialsRef.current.red.opacity = visibility;
    materialsRef.current.black.opacity = visibility;
    materialsRef.current.ink.opacity = visibility * 0.88;
    materialsRef.current.inkFill.opacity = visibility;
    heading.current.rotation.y = -Math.atan2(fish.vy, fish.vx);
    tail.current.rotation.y = Math.sin(state.clock.elapsedTime * 7 + fish.phase) * 0.32;
    mouth.current.scale.z = 0.025 + fish.mouthOpen * (isSolidRed ? 0.32 : 0.14);
    mouth.current.scale.x = 0.045 + fish.mouthOpen * (isSolidRed ? 0.04 : 0);
  });

  return (
    <group ref={root} dispose={null}>
      <group ref={heading}>
        <mesh geometry={assets.body} material={materials.white} />
        <lineLoop geometry={assets.bodyOutline} material={materials.ink} />

        <group ref={tail} position={[-0.9, -0.04, 0]}>
          <mesh geometry={assets.tail} material={materials.fin} />
          <lineLoop geometry={assets.tailOutline} material={materials.ink} />
          <mesh geometry={assets.tailRibs} material={materials.inkFill} />
        </group>

        <group position={[0, 0, 0]}>
          <mesh geometry={assets.dorsalFin} material={materials.fin} />
          <lineLoop geometry={assets.dorsalOutline} material={materials.ink} />
          <mesh geometry={assets.dorsalRibs} material={materials.inkFill} />
        </group>
        {[-1, 1].map((side) => (
          <group key={side} position={[0.38, -0.04, -side * 0.22]} scale={[0.8, 1, side * 0.78]}>
            <mesh geometry={assets.pectoralFin} material={materials.fin} />
            <lineLoop geometry={assets.pectoralOutline} material={materials.ink} />
            <mesh geometry={assets.pectoralRibs} material={materials.inkFill} />
          </group>
        ))}
        {[-1, 1].map((side) => (
          <group key={`ventral-${side}`} position={[-0.34, -0.04, -side * 0.16]} scale={[0.56, 1, side * 0.55]}>
            <mesh geometry={assets.ventralFin} material={materials.fin} />
            <lineLoop geometry={assets.ventralOutline} material={materials.ink} />
            <mesh geometry={assets.ventralRibs} material={materials.inkFill} />
          </group>
        ))}

        {assets.redMarks[fishPattern].map((geometry, markIndex) => (
          <mesh key={`red-${markIndex}`} geometry={geometry} material={materials.red} />
        ))}
        {assets.blackMarks[fishPattern].map((geometry, markIndex) => (
          <mesh key={`black-${markIndex}`} geometry={geometry} material={materials.black} />
        ))}

        {[-1, 1].map((side) => (
          <group key={`eye-${side}`}>
            <mesh
              geometry={assets.sphere}
              material={materials.black}
              position={[0.82, 0.052, side * 0.055]}
              scale={[0.035, 0.025, 0.035]}
            />
          </group>
        ))}

        <mesh
          ref={mouth}
          geometry={assets.sphere}
          material={materials.black}
          position={[1.005, 0.045, 0]}
          scale={[0.045, 0.02, 0.025]}
        />
      </group>
    </group>
  );
}

export function FishScene({ fishRef, count }: { fishRef: FishRef; count: number }) {
  const assets = useMemo(() => createFishAssets(), []);

  useEffect(() => () => {
    assets.geometries.forEach((geometry) => geometry.dispose());
    assets.materials.forEach((material) => material.dispose());
  }, [assets]);

  return (
    <>
      <group dispose={null}>
        {Array.from({ length: count }, (_, index) => (
          <FishModel
            key={index}
            fishRef={fishRef}
            index={index}
            pattern={index === count - 1 ? SOLID_RED_PATTERN : index % 3}
            assets={assets}
          />
        ))}
      </group>
    </>
  );
}
