"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "../app/mainpage.css";
// --- Main React Component ---
import { Lato } from 'next/font/google'

// If loading a variable font, you don't need to specify the weight
const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'], // choose the weights you need
})

export default function LandingPage() {
  const mountRef = useRef(null);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);

  // Updated shape information for educational theme
  const shapeInfo = [
    { name: "Globe", text: "Explore a world of educational opportunities." },
    {
      name: "Book",
      text: "Deepen your knowledge with our vast resource library.",
    },
    {
      name: "Torus",
      text: "Connect with a global community of learners and educators.",
    },
  ];

  // Helper function to create book page positions for flipping animation
  const createBookPagePositions = (flipProgress = 0) => {
    const positions = [];
    // --- MODIFICATION START: Increased particle density for the book ---
    const pageCount = 50; // More pages
    const pageWidth = 12;
    const pageHeight = 16;
    const pageThickness = 0.15;
    const pointsPerPage = 550; // More points per page for a denser look
    // --- MODIFICATION END ---

    for (let i = 0; i < pageCount; i++) {
      const pageProgress = i / pageCount;
      const isFlipping = pageProgress < flipProgress;

      for (let j = 0; j < pointsPerPage; j++) {
        let x, y, z;

        if (isFlipping) {
          // Page has been flipped (left side)
          const u = Math.random();
          const v = Math.random();

          // Create a curved flip animation
          const flipAngle = Math.PI * (1 - (flipProgress - pageProgress) / flipProgress);
          const curveFactor = Math.sin(flipAngle * 0.5) * 3;

          x = -pageWidth / 2 + (Math.random() - 0.5) * pageWidth * 0.9;
          y = (v - 0.5) * pageHeight;
          z = -i * pageThickness - Math.random() * pageThickness + curveFactor;

        } else {
          // Page hasn't been flipped yet (right side)
          const u = Math.random();
          const v = Math.random();

          // Check if this is the currently flipping page
          const isCurrentPage = Math.abs(pageProgress - flipProgress) < 0.05;

          if (isCurrentPage && flipProgress > 0 && flipProgress < 1) {
            // This page is currently flipping - create curved motion
            const localFlipProgress = (flipProgress - pageProgress + 0.05) / 0.1;
            const flipAngle = localFlipProgress * Math.PI;

            // Create a page curl effect
            const curlAmount = Math.sin(flipAngle) * 0.5;
            const baseX = pageWidth / 2 * (1 - localFlipProgress * 2);

            x = baseX + (Math.random() - 0.5) * pageWidth * 0.9 * Math.cos(flipAngle);
            y = (v - 0.5) * pageHeight;
            z = i * pageThickness + Math.sin(flipAngle) * 4 + (Math.random() - 0.5) * curlAmount;

            // Add some curl to the edge of the page
            if (u > 0.7) {
              z += Math.sin(v * Math.PI) * curlAmount * 2;
            }
          } else {
            // Static page on the right
            x = pageWidth / 2 + (Math.random() - 0.5) * pageWidth * 0.9;
            y = (v - 0.5) * pageHeight;
            z = i * pageThickness + Math.random() * pageThickness;
          }
        }

        positions.push(x, y, z);
      }
    }

    // --- MODIFICATION START: Increased spine particle count to match page density ---
    // Add spine particles
    for (let i = 0; i < 800; i++) {
      const y = (Math.random() - 0.5) * pageHeight;
      const x = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * pageCount * pageThickness;
      positions.push(x, y, z);
    }
    // --- MODIFICATION END ---

    return new Float32Array(positions);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // --- Basic Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // --- Particle and Geometry Creation ---
    const NUM_PARTICLES = 25000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_PARTICLES * 3);

    // Create different shapes to morph between
    const globe = new THREE.SphereGeometry(10, 128, 128);
    const torus = new THREE.TorusGeometry(8, 3, 32, 200);

    // Initialize particles in random positions
    for (let i = 0; i < NUM_PARTICLES; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Store book flip progress
    let bookFlipProgress = 0;
    let bookFlipDirection = 1;

    // --- Shaders (The Core of the Animation) ---
    const vertexShader = `
      uniform float u_time;
      uniform float u_progress;
      uniform vec3 u_mouse;
      
      attribute vec3 targetPosition;
      varying vec3 vPosition;

      void main() {
        // Morphing Animation
        vec3 morphedPosition = mix(position, targetPosition, u_progress);

        // Mouse Interaction
        float dist = distance(morphedPosition, u_mouse);
        float force = smoothstep(6.0, 0.0, dist);
        vec3 direction = normalize(morphedPosition - u_mouse);
        vec3 finalPosition = morphedPosition + direction * force * 5.0;
        vPosition = finalPosition;

        vec4 modelViewPosition = modelViewMatrix * vec4(finalPosition, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
        gl_PointSize = 2.5 / -modelViewPosition.z;
      }
    `;

    const fragmentShader = `
      uniform int u_shapeIndex;
      uniform float u_bookFlipProgress;
      varying vec3 vPosition;

      // GLSL Simplex Noise 3D function by Stefan Gustavson
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      void main() {
        vec3 color = vec3(1.0);
        float alpha = 0.8;

        if (u_shapeIndex == 0) { // Globe
            vec3 normPos = normalize(vPosition);
            float noise = snoise(normPos * 3.5);
            if (noise > 0.1) {
                // Gold landmass
                color = vec3(0.9, 0.7, 0.2); 
                alpha = 0.9;
            } else {
                // Blue ocean
                color = vec3(0.1, 0.4, 0.8);
                alpha = 0.7;
            }
        } else if (u_shapeIndex == 1) { // Book
            // Create paper-like appearance with slight variations
            float pageVariation = snoise(vPosition * 0.5);
            
            // Determine if particle is on a flipping page
            float flipZone = abs(vPosition.x) < 2.0 ? 1.0 : 0.0;
            
            // Base paper color - off-white/cream
            color = vec3(0.95, 0.92, 0.88);
            
            // Add text-like darker spots randomly
            if (pageVariation > 0.3 && abs(vPosition.y) < 6.0) {
                color = vec3(0.2, 0.2, 0.25); // Dark ink color
                alpha = 0.9;
            } else if (abs(vPosition.x) < 0.5) {
                // Spine area - darker brown
                color = vec3(0.4, 0.25, 0.15);
                alpha = 0.95;
            } else {
                // Regular page with slight variations
                color = mix(color, vec3(0.85, 0.82, 0.78), pageVariation * 0.3);
                alpha = 0.85 + flipZone * 0.1;
            }
            
            // Add subtle shadows for depth
            float shadow = smoothstep(-8.0, 8.0, vPosition.z);
            color *= (0.7 + shadow * 0.3);
            
        } else { // Torus
            // White
            color = vec3(1.0, 1.0, 1.0);
        }
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    // --- Material and Points Object ---
    const uniforms = {
      u_time: { value: 0.0 },
      u_progress: { value: 0.0 },
      u_mouse: { value: new THREE.Vector3() },
      u_shapeIndex: { value: 0 },
      u_bookFlipProgress: { value: 0.0 },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    const particles = new THREE.Points(particlesGeometry, shaderMaterial);
    scene.add(particles);

    // --- Animation Logic ---
    let currentShape = 0;
    let transitionStartTime = 0;
    const transitionDuration = 2.5;

    const updateTargetPositions = () => {
      const targetPositions = new Float32Array(NUM_PARTICLES * 3);

      if (currentShape === 0) {
        // Globe
        const sourcePositions = globe.attributes.position;
        for (let i = 0; i < NUM_PARTICLES; i++) {
          const index = i % sourcePositions.count;
          targetPositions[i * 3] = sourcePositions.getX(index);
          targetPositions[i * 3 + 1] = sourcePositions.getY(index);
          targetPositions[i * 3 + 2] = sourcePositions.getZ(index);
        }
      } else if (currentShape === 1) {
        // Book - use dynamic positions
        const bookPositions = createBookPagePositions(bookFlipProgress);
        for (let i = 0; i < NUM_PARTICLES; i++) {
          const index = i % (bookPositions.length / 3);
          targetPositions[i * 3] = bookPositions[index * 3];
          targetPositions[i * 3 + 1] = bookPositions[index * 3 + 1];
          targetPositions[i * 3 + 2] = bookPositions[index * 3 + 2];
        }
      } else {
        // Torus
        const sourcePositions = torus.attributes.position;
        for (let i = 0; i < NUM_PARTICLES; i++) {
          const index = i % sourcePositions.count;
          targetPositions[i * 3] = sourcePositions.getX(index);
          targetPositions[i * 3 + 1] = sourcePositions.getY(index);
          targetPositions[i * 3 + 2] = sourcePositions.getZ(index);
        }
      }

      particlesGeometry.setAttribute(
        "targetPosition",
        new THREE.BufferAttribute(targetPositions, 3)
      );
      uniforms.u_shapeIndex.value = currentShape;
      setCurrentShapeIndex(currentShape);
    };
    updateTargetPositions();

    // --- Event Listeners ---
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Render Loop ---
    const clock = new THREE.Clock();
    let lastBookUpdateTime = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      uniforms.u_time.value = elapsedTime;

      const timeSinceTransition = elapsedTime - transitionStartTime;
      if (timeSinceTransition > transitionDuration + 3.0) {
        // 3 second pause
        currentShape = (currentShape + 1) % 3; // Changed to 3 shapes
        updateTargetPositions();
        transitionStartTime = elapsedTime;

        // Reset book flip when transitioning away from book
        if (currentShape !== 1) {
          bookFlipProgress = 0;
          bookFlipDirection = 1;
        }
      }

      const progress = Math.min(timeSinceTransition / transitionDuration, 1.0);
      uniforms.u_progress.value = 1.0 - Math.pow(1.0 - progress, 4.0);

      // Animate book flipping when it's the current shape
      if (currentShape === 1 && progress > 0.9) {
        // Update book flip animation
        bookFlipProgress += bookFlipDirection * 0.008; // Adjust speed here

        if (bookFlipProgress >= 1) {
          bookFlipProgress = 1;
          bookFlipDirection = -1;
        } else if (bookFlipProgress <= 0) {
          bookFlipProgress = 0;
          bookFlipDirection = 1;
        }

        uniforms.u_bookFlipProgress.value = bookFlipProgress;

        // Update book positions continuously during flip
        if (elapsedTime - lastBookUpdateTime > 0.016) { // ~60fps update
          updateTargetPositions();
          lastBookUpdateTime = elapsedTime;
        }
      }

      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      uniforms.u_mouse.value.lerp(pos, 0.1);
      
      // --- MODIFICATION START: Added specific infinity animation for the Torus ---
      // Different rotation for different shapes
      if (currentShape === 1) {
        // Book - gentle sway
        particles.rotation.y = Math.sin(elapsedTime * 0.2) * 0.15;
        particles.rotation.x = Math.sin(elapsedTime * 0.15) * 0.05;
        particles.rotation.z = 0; // Reset z-rotation
      } else if (currentShape === 2) {
        // Torus - infinity (figure-eight) animation
        const speed = 0.4;
        particles.rotation.y = Math.sin(elapsedTime * speed) * Math.PI * 0.2;
        particles.rotation.x = Math.cos(elapsedTime * speed) * Math.PI * 0.15;
        particles.rotation.z = Math.sin(elapsedTime * speed) * Math.PI * 0.1;
      }
      else {
        // Globe - normal rotation
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.02;
        particles.rotation.z = 0; // Reset z-rotation
      }
      // --- MODIFICATION END ---

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // --- Cleanup and Resize ---
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={lato.className} id="landinghome">
    <div className="relative min-h-screen w-full bg-black-900 text-white overflow-hidden">
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="animate-fade-in-down mb-12">
          <h1 className="heading_landing">Welcome to School Finder</h1>
          <div className="content_landing">
            {shapeInfo.map((info, index) => (
              <span
                key={info.name}
                className={`absolute w-full left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
                  currentShapeIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                {info.text}
              </span>
            ))}
          </div>
        </div>

        <div className="button_landing">
          <a href="show-schools" className="button_show">
            <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="24" 
  height="24" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
  <circle cx="11" cy="11" r="8"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>

            Explore Schools
          </a>
          <a href="add-school" className="button_add">
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path
                d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
                fill="currentColor"
              ></path>
            </svg>
            Add a School
          </a>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
    </div>
  );
}