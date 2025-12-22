export interface FloorDto {
  id: string;
  buildingId: string;
  name: string;
  floorNumber: number;
  floorPlanImageUrl?: string;
}

export interface CreateFloorCommand {
  buildingId: string;
  name: string;
  floorNumber: number;
  floorPlanImageUrl?: string;
}

export interface UpdateFloorCommand {
  id: string;
  buildingId: string;
  name: string;
  floorNumber: number;
  floorPlanImageUrl?: string;
}

