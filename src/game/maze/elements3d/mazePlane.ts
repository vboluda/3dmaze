import type { mazeStaticObject } from "../../base/objects3d/mazeStaticObject";
import type { mazeContext } from "../../base/mazeContext";
import { GridHelper, Mesh, MeshStandardMaterial, PlaneGeometry } from "three";


export default class mazePlane implements mazeStaticObject {
  private planeMesh: Mesh<PlaneGeometry, MeshStandardMaterial> | null = null;
  private gridHelper: GridHelper | null = null;

    constructor() {}

  init(mazeContext: mazeContext): void {
    if (this.planeMesh || this.gridHelper) {
      this.dispose(mazeContext);
    }

    const scene = mazeContext.getScene();

    const planeGeometry = new PlaneGeometry(32, 32);
    const planeMaterial = new MeshStandardMaterial({ color: 0x4f5d42 });

    this.planeMesh = new Mesh(planeGeometry, planeMaterial);
    this.planeMesh.rotation.x = -Math.PI / 2;
    this.planeMesh.receiveShadow = true;

    this.gridHelper = new GridHelper(32, 32, 0x404040, 0x808080);

    scene.add(this.planeMesh);
    scene.add(this.gridHelper);
    }

  dispose(mazeContext: mazeContext): void {
    const scene = mazeContext.getScene();

    if (this.planeMesh) {
      scene.remove(this.planeMesh);
      this.planeMesh.geometry.dispose();
      this.planeMesh.material.dispose();
      this.planeMesh = null;
    }

    if (this.gridHelper) {
      scene.remove(this.gridHelper);
      this.gridHelper.geometry.dispose();
      if (Array.isArray(this.gridHelper.material)) {
        for (const material of this.gridHelper.material) {
          material.dispose();
        }
      } else {
        this.gridHelper.material.dispose();
      }
      this.gridHelper = null;
    }
  }
}