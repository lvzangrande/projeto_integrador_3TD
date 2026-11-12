'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  OCEAN_CONFIG,
  waterVertexShader,
  waterFragmentShader,
  skyVertexShader,
  skyFragmentShader,
} from './oceanShaders';

export default function OceanBackground() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    } catch {
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, host.clientWidth / host.clientHeight, 0.1, 1800);
    camera.position.set(0, 5.5, 14);
    camera.lookAt(0, 0, -24);

    const sunDir = new THREE.Vector3(...OCEAN_CONFIG.sunDirection).normalize();

    // Céu (esfera que acompanha a câmera)
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 16);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: { uSunDir: { value: sunDir } },
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.frustumCulled = false;
    sky.renderOrder = -1;
    scene.add(sky);

    // Mar
    const geometry = new THREE.PlaneGeometry(1200, 1200, 200, 200);
    geometry.rotateX(-Math.PI / 2);
    const uniforms = {
      uTime: { value: 0 },
      uSunDir: { value: sunDir },
      uNormalStrength: { value: OCEAN_CONFIG.normalStrength },
      uDetailHeight: { value: OCEAN_CONFIG.detailHeight },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      side: THREE.DoubleSide,
    });
    const sea = new THREE.Mesh(geometry, material);
    sea.position.z = -270;
    scene.add(sea);

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Em modo de movimento reduzido: um único quadro, já com a água "em repouso".
    const STATIC_TIME = 8;
    const timer = new THREE.Timer();
    timer.connect(document);
    let frameId;

    const render = (timestamp) => {
      timer.update(timestamp);
      const time = reducedMotion ? STATIC_TIME : timer.getElapsed() + STATIC_TIME * 0.25;
      uniforms.uTime.value = time;

      const descent = THREE.MathUtils.smoothstep(Math.min(time, 18), 0, 18);
      camera.position.x = Math.sin(time * 0.12) * 0.32;
      camera.position.y = 5.5 - descent * 3.05 + Math.sin(time * 0.48) * 0.12;
      camera.position.z = 14 - descent * 11 + Math.sin(time * 0.17) * 0.38;
      camera.lookAt(Math.sin(time * 0.1) * 1.2, -0.15, -24 + descent * 8);
      sky.position.copy(camera.position);

      renderer.render(scene, camera);
      if (!reducedMotion) frameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      timer.dispose();
      resizeObserver.disconnect();
      skyGeometry.dispose();
      skyMaterial.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="ocean-background" aria-hidden="true"><div className="ocean-vignette"/></div>;
}
