import * as FileSystem from "expo-file-system/legacy";
import { BuildingService } from "../api/building.service";
import { FloorService } from "../api/floor.service";
import { NodeService } from "../api/node.service";
import { EdgeService } from "../api/edge.service";
import { BuildingDto } from "../types/building.types";
import { FloorDto } from "../types/floor.types";
import { NodeDto } from "../types/node.types";
import { EdgeDto } from "../types/edge.types";

interface OfflineBuildingData {
  building: BuildingDto;
  floors: FloorDto[];
  nodes: NodeDto[];
  edges: EdgeDto[];
  cachedAt: string;
}

export class OfflineDataService {
  private static get CACHE_DIR() {
    return `${FileSystem.documentDirectory}cache/`;
  }

  /**
   * Initialize cache directory
   */
  static async initialize(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.CACHE_DIR, {
        intermediates: true,
      });
    }
  }

  /**
   * Download building data for offline use
   */
  static async downloadBuildingData(buildingId: string): Promise<void> {
    await this.initialize();

    // Fetch all data
    const building = await BuildingService.getById(buildingId);
    const floors = await FloorService.getByBuilding(buildingId);

    const nodes: NodeDto[] = [];
    for (const floor of floors) {
      const floorNodes = await NodeService.getByFloor(floor.id);
      nodes.push(...floorNodes);

      // Download floor plan image
      if (floor.floorPlanImageUrl) {
        await this.downloadFloorPlanImage(floor);
      }
    }

    // Fetch edges
    const edges = await EdgeService.getAll();

    // Save to local storage
    const data: OfflineBuildingData = {
      building,
      floors,
      nodes,
      edges,
      cachedAt: new Date().toISOString(),
    };

    const filePath = `${this.CACHE_DIR}building_${buildingId}.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));

    console.log(`Downloaded building ${buildingId} for offline use`);
  }

  /**
   * Download floor plan image
   */
  private static async downloadFloorPlanImage(floor: FloorDto): Promise<void> {
    if (!floor.floorPlanImageUrl) return;

    try {
      const imageUri = `${this.CACHE_DIR}floor_${floor.id}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(
        floor.floorPlanImageUrl,
        imageUri
      );

      if (downloadResult.status === 200) {
        console.log(`Downloaded floor plan for floor ${floor.id}`);
      }
    } catch (error) {
      console.error(`Failed to download floor plan for ${floor.id}:`, error);
    }
  }

  /**
   * Get cached building data
   */
  static async getCachedBuilding(
    buildingId: string
  ): Promise<OfflineBuildingData | null> {
    const filePath = `${this.CACHE_DIR}building_${buildingId}.json`;

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return null;
    }

    const json = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(json) as OfflineBuildingData;
  }

  /**
   * Get cached floor plan image URI
   */
  static async getCachedFloorPlanUri(floorId: string): Promise<string | null> {
    const imageUri = `${this.CACHE_DIR}floor_${floorId}.jpg`;

    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      return null;
    }

    return imageUri;
  }

  /**
   * Check if building is cached
   */
  static async isBuildingCached(buildingId: string): Promise<boolean> {
    const filePath = `${this.CACHE_DIR}building_${buildingId}.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists;
  }

  /**
   * Clear cached building data
   */
  static async clearCache(buildingId?: string): Promise<void> {
    if (buildingId) {
      // Clear specific building
      const filePath = `${this.CACHE_DIR}building_${buildingId}.json`;
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    } else {
      // Clear all cache
      await FileSystem.deleteAsync(this.CACHE_DIR, { idempotent: true });
      await this.initialize();
    }
  }

  /**
   * Get cache size in MB
   */
  static async getCacheSize(): Promise<number> {
    const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
    if (!dirInfo.exists) return 0;

    const files = await FileSystem.readDirectoryAsync(this.CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(
        `${this.CACHE_DIR}${file}`
      );
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize / (1024 * 1024); // Convert to MB
  }

  /**
   * Cache building list
   */
  static async cacheBuildingList(buildings: BuildingDto[]): Promise<void> {
    await this.initialize();
    const filePath = `${this.CACHE_DIR}buildings_list.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(buildings));
  }

  /**
   * Get cached building list
   */
  static async getCachedBuildingList(): Promise<BuildingDto[] | null> {
    const filePath = `${this.CACHE_DIR}buildings_list.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return null;
    }
    const json = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(json) as BuildingDto[];
  }

  /**
   * Cache node list
   */
  static async cacheNodeList(nodes: NodeDto[]): Promise<void> {
    await this.initialize();
    const filePath = `${this.CACHE_DIR}nodes_list.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(nodes));
  }

  /**
   * Get cached node list
   */
  static async getCachedNodeList(): Promise<NodeDto[] | null> {
    const filePath = `${this.CACHE_DIR}nodes_list.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return null;
    }
    const json = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(json) as NodeDto[];
  }
}

