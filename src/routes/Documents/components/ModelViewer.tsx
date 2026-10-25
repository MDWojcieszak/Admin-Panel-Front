import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mkUseStyles, useTheme } from '~/utils/theme';

const MATERIAL = () => new THREE.MeshStandardMaterial({ color: 0xb7d3e8, metalness: 0.1, roughness: 0.6 });

/** Every mesh gets a plain material when the file brings none (STL, PLY, bare OBJ). */
const loadModel = async (url: string, extension: string): Promise<THREE.Object3D> => {
  switch (extension) {
    case 'stl':
    case 'ply': {
      const loader = extension === 'stl' ? new STLLoader() : new PLYLoader();
      const geometry = await loader.loadAsync(url);
      geometry.computeVertexNormals();
      return new THREE.Mesh(geometry, MATERIAL());
    }
    case 'obj': {
      const object = await new OBJLoader().loadAsync(url);
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) child.material = MATERIAL();
      });
      return object;
    }
    case '3mf':
      return new ThreeMFLoader().loadAsync(url);
    case 'glb':
      return (await new GLTFLoader().loadAsync(url)).scene;
    default:
      throw new Error(`.${extension} cannot be shown here`);
  }
};

/**
 * A 3D model to turn around: drag to orbit, scroll to zoom. Loaded from the
 * document's signed URL; the scene is torn down when the panel closes.
 */
const ModelViewer = ({ url, extension }: { url: string; extension: string }) => {
  const styles = useStyles();
  const theme = useTheme();
  const mount = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | string>('loading');

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(1, 2, 3);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.01, 10000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };

    const resize = new ResizeObserver(() => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    });
    resize.observe(host);

    loadModel(url, extension)
      .then((object) => {
        if (disposed) return;
        // Centre it and frame the camera on its size, whatever the units.
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length() || 1;
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        scene.add(object);
        camera.position.set(size * 0.6, size * 0.45, size * 0.8);
        camera.near = size / 1000;
        camera.far = size * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        setState('ready');
        tick();
      })
      .catch((error: Error) => !disposed && setState(error.message || 'The model could not be read.'));

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [url, extension]);

  return (
    <div style={styles.wrap}>
      <div ref={mount} style={styles.canvas} />
      {state !== 'ready' ? (
        <span style={{ ...styles.overlay, color: state === 'loading' ? theme.colors.dark05 : theme.colors.red }}>
          {state === 'loading' ? 'Loading the model…' : state}
        </span>
      ) : (
        <span style={styles.hint}>Drag to turn · scroll to zoom</span>
      )}
    </div>
  );
};

export default ModelViewer;

const useStyles = mkUseStyles((t) => ({
  wrap: { position: 'relative', height: '55vh', minHeight: 280 },
  canvas: { position: 'absolute', inset: 0, cursor: 'grab' },
  overlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    padding: t.spacing.m,
    textAlign: 'center',
  },
  hint: { position: 'absolute', bottom: t.spacing.s, right: t.spacing.sm, fontSize: 11, color: t.colors.dark05 },
}));
