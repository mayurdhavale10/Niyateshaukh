'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

export default function MehfilGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 50;

    let seed = 12345;
    function seededRandom(): number {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    function createStarShape(innerRadius: number, outerRadius: number, points: number): THREE.Shape {
      const shape = new THREE.Shape();
      const angleStep = (Math.PI * 2) / points;

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * angleStep) / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      shape.closePath();
      return shape;
    }

    const stars: THREE.Mesh[] = [];
    const starCount = 300;

    for (let i = 0; i < starCount; i++) {
      const size = seededRandom() * 0.3 + 0.2;
      const starShape = createStarShape(size * 0.4, size, 5);

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: size * 0.3,
        bevelEnabled: true,
        bevelThickness: size * 0.1,
        bevelSize: size * 0.1,
        bevelSegments: 2,
      };

      const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      const colorChoice = seededRandom();
      let color: THREE.Color;

      if (colorChoice > 0.6) {
        color = new THREE.Color(0xba55d3);
      } else if (colorChoice > 0.3) {
        color = new THREE.Color(0xe8d5f0);
      } else {
        color = new THREE.Color(0xffffff);
      }

      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        shininess: 100,
      });

      const star = new THREE.Mesh(geometry, material);
      star.position.set(
        (seededRandom() - 0.5) * 150,
        (seededRandom() - 0.5) * 150,
        (seededRandom() - 0.5) * 100 - 50
      );
      star.rotation.set(
        seededRandom() * Math.PI,
        seededRandom() * Math.PI,
        seededRandom() * Math.PI
      );
      star.userData = {
        rotationSpeed: {
          x: (seededRandom() - 0.5) * 0.02,
          y: (seededRandom() - 0.5) * 0.02,
          z: (seededRandom() - 0.5) * 0.02,
        }
      };

      scene.add(star);
      stars.push(star);
    }

    const ambientLight = new THREE.AmbientLight(0x6a3a8a, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 150);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    const shootingStars: THREE.Line[] = [];

    function createShootingStar(): void {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(100 * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geometry, material);
      const startX = (Math.random() - 0.5) * 200;
      const startY = Math.random() * 80 + 20;
      const startZ = (Math.random() - 0.5) * 100;

      line.userData = {
        speed: Math.random() * 0.5 + 0.3,
        life: 0,
        start: new THREE.Vector3(startX, startY, startZ),
        direction: new THREE.Vector3(-1, -1, 0).normalize()
      };

      scene.add(line);
      shootingStars.push(line);
    }

    let shootingStarTimer = 0;

    function animate(): void {
      requestAnimationFrame(animate);

      stars.forEach(star => {
        star.rotation.x += star.userData.rotationSpeed.x;
        star.rotation.y += star.userData.rotationSpeed.y;
        star.rotation.z += star.userData.rotationSpeed.z;
      });

      stars.forEach(star => {
        if (Math.random() > 0.98) {
          const material = star.material as THREE.MeshPhongMaterial;
          material.emissiveIntensity = Math.random() * 0.8 + 0.4;
        }
      });

      shootingStarTimer++;
      if (shootingStarTimer > 40 && shootingStars.length < 15) {
        createShootingStar();
        shootingStarTimer = 0;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.userData.life += star.userData.speed;

        const positions = star.geometry.attributes.position.array as Float32Array;
        const startPos = star.userData.start as THREE.Vector3;
        const direction = star.userData.direction as THREE.Vector3;

        for (let j = 0; j < 100; j++) {
          const offset = star.userData.life - j * 0.1;
          positions[j * 3] = startPos.x + direction.x * offset;
          positions[j * 3 + 1] = startPos.y + direction.y * offset;
          positions[j * 3 + 2] = startPos.z + direction.z * offset;
        }

        star.geometry.attributes.position.needsUpdate = true;
        
        const material = star.material as THREE.LineBasicMaterial;
        material.opacity = Math.max(0, 1 - star.userData.life / 30);

        if (star.userData.life > 30) {
          scene.remove(star);
          shootingStars.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    function handleResize(): void {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleContactUs = () => {
    router.push('/contactus');
  };

  const featuredImage = { id: 6, image: '/mehfil/m6.webp' };
  
  const images = [
    { id: 1, image: '/mehfil/m1.webp' },
    { id: 2, image: '/mehfil/m2.webp' },
    { id: 3, image: '/mehfil/m3.webp' },
    { id: 4, image: '/mehfil/m4.webp' },
    { id: 5, image: '/mehfil/m5.webp' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;600&display=swap"
        rel="stylesheet"
      />

      {/* Purple gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900" />

      {/* Three.js canvas */}
      <div ref={containerRef} className="fixed inset-0 z-0" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen pt-12 pb-20 px-4">
        {/* Header */}
        <h1
          className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Mehfil ❤️
        </h1>

        <p
          className="text-lg md:text-xl text-purple-100 mb-8 text-center max-w-2xl drop-shadow-md"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Be a Part of Our Success: Sponsor the Next Chapter of Mehfil!
        </p>

        {/* Contact Us Button */}
        <button
          onClick={handleContactUs}
          className="mb-12 px-8 py-3 bg-white text-purple-900 font-semibold rounded-full shadow-lg hover:bg-purple-100 hover:scale-105 transition-all duration-300"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Contact Us
        </button>

        {/* Featured Image - m6.webp at top */}
        <div className="mb-12 w-full max-w-4xl">
          <div className="group relative overflow-hidden rounded-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="relative w-full h-96 bg-purple-900/20">
              <Image
                src={featuredImage.image}
                alt="Featured Mehfil photo"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
          </div>
        </div>

        {/* Photo Grid - remaining photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
          {images.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              {/* Image Container */}
              <div className="relative w-full h-64 bg-purple-900/20">
                <Image
                  src={item.image}
                  alt={`Mehfil photo ${item.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}