import { FloorDto } from "./floor.types";

export interface BuildingDto {
  id: string;
  name: string;
  address?: string;
  floors: FloorDto[];
}

export interface CreateBuildingCommand {
  name: string;
  address?: string;
}

export interface UpdateBuildingCommand {
  id: string;
  name: string;
  address?: string;
}

