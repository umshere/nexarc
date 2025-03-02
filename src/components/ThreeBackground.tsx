import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  selectedText?: string;
}

function ThreeBackground({ selectedText }: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId: number;
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // Create a plane with a custom shader material
    const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(width, height) },
        textEffect: { value: selectedText ? 1.0 : 0.0 },
        mousePosition: { value: new THREE.Vector2(0.5, 0.5) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        // Netflix-inspired red/blue gradient with a bit of swirl
        uniform float time;
        uniform vec2 resolution;
        uniform float textEffect;
        uniform vec2 mousePosition;
        varying vec2 vUv;

        // Simple 2D noise (snoise) helpers
        // (Same code as before if you want a swirling effect. Otherwise you can remove or simplify.)
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                              -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                       + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                 dot(x12.zw,x12.zw)), 0.0);
          m = m*m; m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 *
               (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          // Convert vUv from [0,1] to [-1,1]
          vec2 uv = vUv * 2.0 - 1.0;
          uv.x *= resolution.x / resolution.y; // correct aspect

          // Mouse interaction
          vec2 mouseUV = mousePosition * 2.0 - 1.0;
          float mouseDist = length(uv - mouseUV);
          // We can scale or offset this as needed
          float mouseEffect = 1.0 - smoothstep(0.0, 0.5, mouseDist);

          // A little swirl or noise based on time + uv
          float n = snoise(uv * 2.0 + time * 0.5);
          float swirl = sin(n * 3.14159 + time);

          // Base gradient from red to blue
          // You can tweak these to your liking!
          vec3 redColor = vec3(0.8, 0.0, 0.0);
          vec3 blueColor = vec3(0.0, 0.0, 0.8);

          // Mix factor from 0..1
          float gradientFactor = 0.5 * (uv.y + 1.0); // range [0..1] as y goes -1..1
          // Add swirl/noise into the gradient
          gradientFactor += 0.2 * swirl;

          // Clamp so it doesn’t blow out
          gradientFactor = clamp(gradientFactor, 0.0, 1.0);

          // Final color
          vec3 color = mix(redColor, blueColor, gradientFactor);

          // Text selection effect: if textEffect is 1, we amp the brightness
          // or do something subtle:
          float textGlow = 0.3 * textEffect * sin(time * 5.0 + uv.x * 5.0);
          color += textGlow;

          // Mouse highlight
          color += mouseEffect * 0.1;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - (e.clientY / window.innerHeight); // invert Y for shader coords
      material.uniforms.mousePosition.value.set(x, y);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      material.uniforms.time.value += 0.01;

      // Smooth transition for text effect
      const targetEffect = selectedText ? 1.0 : 0.0;
      material.uniforms.textEffect.value = THREE.MathUtils.lerp(
        material.uniforms.textEffect.value,
        targetEffect,
        0.05
      );

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      material.uniforms.resolution.value.set(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [selectedText]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: "none"
      }}
    />
  );
}

export default ThreeBackground;
