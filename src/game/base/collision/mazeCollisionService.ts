
import type { ICollider } from "./ICollider";
import type { Vector3 } from "three";

export class mazeCollisionService {
    private readonly colliders = new Set<ICollider>();

    register(collider: ICollider): void {
        this.colliders.add(collider);
    }

    unregister(collider: ICollider): void {
        this.colliders.delete(collider);
    }

    resolvePosition(position: Vector3, radius: number, playerHeight: number): Vector3 {
        const result = position.clone();

        for (const collider of this.colliders) {
            const aabb = collider.getAABB();
            if (!aabb) continue;

            // Skip if box is entirely above player's head or below the floor
            if (aabb.minY >= playerHeight || aabb.maxY <= 0) continue;

            const closestX = Math.max(aabb.minX, Math.min(result.x, aabb.maxX));
            const closestZ = Math.max(aabb.minZ, Math.min(result.z, aabb.maxZ));

            const dx = result.x - closestX;
            const dz = result.z - closestZ;
            const distSq = dx * dx + dz * dz;

            if (distSq >= radius * radius) continue;

            const dist = Math.sqrt(distSq);

            if (dist > 0) {
                // Circle center outside AABB: push along the contact normal
                const overlap = radius - dist;
                result.x += (dx / dist) * overlap;
                result.z += (dz / dist) * overlap;
            } else {
                // Circle center inside AABB: push out along axis of minimum penetration
                const depthX = Math.min(result.x - aabb.minX, aabb.maxX - result.x);
                const depthZ = Math.min(result.z - aabb.minZ, aabb.maxZ - result.z);

                if (depthX < depthZ) {
                    result.x = result.x - aabb.minX < aabb.maxX - result.x
                        ? aabb.minX - radius
                        : aabb.maxX + radius;
                } else {
                    result.z = result.z - aabb.minZ < aabb.maxZ - result.z
                        ? aabb.minZ - radius
                        : aabb.maxZ + radius;
                }
            }
        }

        return result;
    }
}