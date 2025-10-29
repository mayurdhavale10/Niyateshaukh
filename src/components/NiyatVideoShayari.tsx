'use client';

import React, { useEffect, useRef } from 'react';
import { PlayCircle, Feather } from 'lucide-react';
import * as THREE from 'three';

const VIDEO_ID = 'dAz9Birr4Qs';

export default function NiyatVideoShayari() {
  const containerRef = useRef<HTMLDivElement>(null);

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

    const stars: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhongMaterial>[] = [];
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

    const shootingStars: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    
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
          star.material.emissiveIntensity = Math.random() * 0.8 + 0.4;
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
        star.material.opacity = Math.max(0, 1 - star.userData.life / 30);
        
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

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Purple gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #3d1f5c 0%, #1a0033 50%, #0a0015 100%)',
        }}
      />
      
      {/* Three.js canvas */}
      <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} />
      
      {/* Content overlay */}
      <div className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 
              className="text-3xl sm:text-4xl font-extrabold text-white mb-2"
              style={{ fontFamily: "'Berkshire Swash', cursive" }}
            >
              जज़्बात का मंच (The Stage of Emotions)
            </h2>
            <p className="text-purple-300 text-lg">
              Witness the intent behind the desire, live and unfiltered.
            </p>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            
            {/* LEFT COLUMN: Mission Text */}
            <div 
              className="p-6 sm:p-10 rounded-xl shadow-2xl transition-all duration-300 h-full"
              style={{ 
                background: 'rgba(51, 0, 77, 0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 30px rgba(186, 85, 211, 0.2)',
              }}
            >
              <Feather size={32} className="text-purple-400 mb-4" />
              
              <h3 className="text-2xl text-white font-bold mb-4">
                हर अल्फ़ाज़, एक ख़ज़ाना
              </h3>

              <blockquote className="my-6 p-4 border-l-4 border-purple-500 bg-purple-900 bg-opacity-30 rounded-r-lg">
                <p 
                  className="text-xl italic text-purple-200"
                  style={{ fontFamily: "'Berkshire Swash', cursive" }}
                >
                  "यह <strong>'नीयत-ए-शौक़'</strong> है <strong>ख़्वाबों का आशियाना</strong>,<br />
                  <strong>शायर</strong> जहाँ बाँटें <strong>अल्फ़ाज़</strong> का <strong>ख़ज़ाना</strong>।"
                </p>
              </blockquote>

              <p className="text-purple-100 text-lg leading-relaxed mb-6">
                <strong>Niyat-e-Shaukh</strong> is a sacred space for the <strong>pure intention</strong> of creation. It is a promise to every poet, storyteller, and dreamer that their voice will find an attentive ear. 
              </p>
              
              <p className="text-purple-200 text-base leading-relaxed">
                We believe in the raw, unscripted power of emotion. Here, you don't perform for judgment, but for <strong>connection</strong>. We provide the <em>manch</em> (stage) where every story, whether born in the great literary cities or a small corner of the heart, is celebrated equally. Join this movement where the words of today become the legacy of tomorrow.
              </p>

              <button
                className="mt-8 flex items-center justify-center w-full py-3 px-6 rounded-full text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #6a3a8a 0%, #ba55d3 100%)',
                  boxShadow: '0 4px 15px rgba(186, 85, 211, 0.4)',
                }}
              >
                <PlayCircle size={20} className="mr-2" />
                Start Your Story
              </button>
            </div>

            {/* RIGHT COLUMN: YouTube Video */}
            <div className="rounded-xl overflow-hidden shadow-2xl w-full" 
                 style={{ 
                   boxShadow: '0 0 30px rgba(186, 85, 211, 0.3)',
                 }}
            >
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}`}
                  title="Niyat-e-Shaukh Mehfil Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="mt-4 p-4 text-center bg-gray-900 bg-opacity-50 text-purple-400 text-sm rounded-b-xl">
                  A glimpse into the soul of a Niyat-e-Shaukh Mehfil.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <link 
        href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap" 
        rel="stylesheet" 
      />
    </section>
  );
}