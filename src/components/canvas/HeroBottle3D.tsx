'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshReflectorMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function BottleModel() {
  const bottleGroupRef = useRef<THREE.Group>(null);

  const labelTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0E0D12';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = '#C5A038';
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, 464, 464);

      ctx.lineWidth = 1.5;
      ctx.strokeRect(34, 34, 444, 444);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 80px serif';
      ctx.textAlign = 'center';
      ctx.fillText('CC', 256, 160);

      ctx.font = 'bold 30px sans-serif';
      ctx.letterSpacing = '5px';
      ctx.fillText('CABELO CHAVE', 256, 250);

      ctx.fillStyle = '#E8C39E';
      ctx.font = 'italic 18px serif';
      ctx.fillText('PARIS & ZURICH', 256, 290);

      ctx.fillStyle = '#C5A038';
      ctx.font = '15px sans-serif';
      ctx.fillText('ELIXIR ROYAL LUXE 24K', 256, 370);
      ctx.fillText('50ml e 1.7 fl. oz.', 256, 410);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state) => {
    if (!bottleGroupRef.current) return;
    const { pointer } = state;

    bottleGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      bottleGroupRef.current.rotation.y,
      pointer.x * 0.3 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08,
      0.04
    );

    bottleGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      bottleGroupRef.current.rotation.x,
      -pointer.y * 0.15,
      0.04
    );
  });

  return (
    <group ref={bottleGroupRef} position={[0, -0.15, 0]} scale={1.25}>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 1.1, 3.2, 64]} />
          <meshPhysicalMaterial
            color="#121116"
            roughness={0.15}
            metalness={0.45}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            reflectivity={0.9}
          />
        </mesh>

        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.5, 1.05, 0.4, 64]} />
          <meshPhysicalMaterial
            color="#121116"
            roughness={0.15}
            metalness={0.45}
            clearcoat={1.0}
          />
        </mesh>

        <mesh position={[0, 2.15, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.42, 0.3, 32]} />
          <meshStandardMaterial color="#C5A038" metalness={0.9} roughness={0.2} />
        </mesh>

        <mesh position={[0, 2.6, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.6, 64]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {labelTexture && (
          <mesh position={[0, 0, 1.11]}>
            <planeGeometry args={[1.6, 2.4]} />
            <meshStandardMaterial
              map={labelTexture}
              roughness={0.3}
              metalness={0.1}
              transparent
            />
          </mesh>
        )}

        <mesh position={[0, -1.55, 0]}>
          <cylinderGeometry args={[1.11, 1.11, 0.08, 64]} />
          <meshStandardMaterial color="#C5A038" metalness={0.9} roughness={0.15} />
        </mesh>
      </Float>
    </group>
  );
}

const ImageFallback = (
  <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card border border-[#D4AF37]/30 flex items-center justify-center bg-[#0C0B10]">
    <Image
      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=90"
      alt="Cabelo Chave Elixir Royal Luxe 24K"
      fill
      className="object-cover opacity-90"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    <span className="absolute bottom-6 left-6 font-serif text-lg font-bold text-[#D4AF37]">
      Elixir Royal Luxe 24K &bull; Haute Coiffure
    </span>
  </div>
);

export default function HeroBottle3D() {
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

  if (canRenderWebGL === false) {
    return ImageFallback;
  }

  if (canRenderWebGL === null) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border border-[#D4AF37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 7.2]} fov={42} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#FFF8E7" castShadow />
        <directionalLight position={[-4, -2, -4]} intensity={1.0} color="#D4AF37" />
        <pointLight position={[0, 4, 3]} intensity={2.2} color="#FFF5D6" />

        <BottleModel />

        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 18]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mirror={0.35}
            mixBlur={0.8}
            mixStrength={1.2}
            roughness={0.7}
            depthScale={1.2}
            color="#0A0A0C"
            metalness={0.4}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
