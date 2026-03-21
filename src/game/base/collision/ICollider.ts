export type AABB = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
};

export interface ICollider {
    getAABB(): Readonly<AABB> | null;
    getPlayerPushDelta?(): Readonly<{ x: number; z: number }> | null;
}
