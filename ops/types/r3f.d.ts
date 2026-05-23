// React-19-compatible JSX augmentation for @react-three/fiber 8.x.
// R3F 8.x's built-in augmentation uses the React 18 `JSX.IntrinsicElements`
// global namespace, but React 19 moved JSX into the React namespace.
// We re-declare R3F's three-types intrinsics in the global JSX namespace
// so TypeScript accepts <mesh>, <group>, <boxGeometry>, etc.

import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export {};
