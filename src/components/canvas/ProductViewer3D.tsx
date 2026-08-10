'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ProductViewer3DProps {
  bottleColor?: string;
  capColor?: string;
  productName?: string;
  productImage?: string;
}

function Cinematic3DBottle({ bottleColor = '#141318', capColor = '#D4AF37', productName = 'CABELO CHAVE' }: ProductViewer3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.2, 0]} scale={1.15}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Main Bottle Body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.05, 3.0, 64]} />
          <meshPhysicalMaterial
            color={bottleColor}
            roughness={0.15}
            metalness={0.4}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            reflectivity={0.9}
          />
        </mesh>

        {/* Bottle Shoulder */}
        <mesh position={[0, 1.65, 0]} castShadow>
          <cylinderGeometry args={[0.48, 1.0, 0.35, 64]} />
          <meshPhysicalMaterial color={bottleColor} roughness={0.15} metalness={0.4} clearcoat={1.0} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.4, 0.3, 32]} />
          <meshStandardMaterial color={capColor} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Dispenser Pump / Luxury Cap */}
        <mesh position={[0, 2.45, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 64]} />
          <meshStandardMaterial color={capColor} metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Base Ring */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.08, 64]} />
          <meshStandardMaterial color={capColor} metalness={0.9} roughness={0.15} />
        </mesh>
      </Float>
    </group>
  );
}

export default function ProductViewer3D(props: ProductViewer3DProps) {
  const [canRenderWebGL, setCanRenderWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setCanRenderWebGL(!!(gl && gl instanceof WebGLRenderingContext));
    } catch (e) {
      setCanRenderWebGL(false);
    }
  }, []);

  const fallbackImage = props.productImage || 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=85';

  const fallback = (
    <div className="w-full h-full relative rounded-xl overflow-hidden bg-black/60 border border-[#D4AF37]/30 flex items-center justify-center">
      <Image
        src={fallbackImage}
        alt={props.productName || 'Cabelo Chave Product'}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <span className="absolute bottom-3 left-3 text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase">
        {props.productName || 'Cabelo Chave Formulation'}
      </span>
    </div>
  );

  if (canRenderWebGL === false) {
    return fallback;
  }

  if (canRenderWebGL === null) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-[#D4AF37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] relative cursor-grab active:cursor-grabbing">
      <Canvas shadows gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6.2]} fov={45} />
        <ambientLight intensity={1.0} />
        <directionalLight position={[4, 6, 4]} intensity={2.5} color="#FFF5D6" castShadow />
        <directionalLight position={[-4, -2, -4]} intensity={1.5} color="#D4AF37" />
        <pointLight position={[0, 4, 3]} intensity={2.2} color="#FFF8E7" />
        
        <Cinematic3DBottle {...props} />
        
        <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 14]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mirror={0.3}
            mixBlur={0.8}
            mixStrength={1.0}
            roughness={0.7}
            depthScale={1.2}
            color="#0A0A0C"
            metalness={0.4}
          />
        </mesh>

        <OrbitControls
          enableZoom={true}
          minDistance={4}
          maxDistance={9}
          autoRotate={true}
          autoRotateSpeed={2.5}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
