import type { mazeStaticObject } from "../../base/objects3d/mazeStaticObject";
import type { mazeContext } from "../../base/mazeContext";
import { GridHelper, Mesh, MeshStandardMaterial, PlaneGeometry } from "three";


export default class mazePlane implements mazeStaticObject {
  private planeMesh: Mesh<PlaneGeometry, MeshStandardMaterial> | null = null;
  private gridHelper: GridHelper | null = null;
  private gridOn: boolean;

    constructor(gridOn: boolean=false) {
      this.gridOn = gridOn;
    }

    getAABB(): null {
        return null;
    }

  init(mazeContext: mazeContext): void {
    if (this.planeMesh || this.gridHelper) {
      this.dispose(mazeContext);
    }

    const scene = mazeContext.getScene();
    const mazeSize = mazeContext.getMazeSize();
    const planeTexture = mazeContext.getAssetService().getTexture("ConcreteDark");

    const planeGeometry = new PlaneGeometry(mazeSize, mazeSize);
    const planeMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      map: planeTexture,
    });

    this.planeMesh = new Mesh(planeGeometry, planeMaterial);
    this.planeMesh.rotation.x = -Math.PI / 2;
    this.planeMesh.receiveShadow = false;

    scene.add(this.planeMesh);
    
    if (this.gridOn) {
      this.gridHelper = new GridHelper(mazeSize, mazeSize, 0xFF0000, 0xFF0000);
      scene.add(this.gridHelper);
    }
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
