export enum NodeType {
  Room = 0,
  Corridor = 1,
  Elevator = 2,
  Stairs = 3,
  Entrance = 4,
  Restroom = 5,
  InformationDesk = 6,
  Unknown = 7,
}

export interface NodeDto {
  id: string;
  name: string;
  nodeType: NodeType | string; // API may return as string, convert to enum when needed
  x: number;
  y: number;
  qrCode: string;
  floorId: string;
}

export interface CreateNodeCommand {
  name: string;
  nodeType: string; // API expects string name (e.g., "Room", "Corridor", "Elevator")
  x: number;
  y: number;
  floorId: string;
  qrCode?: string;
}

export interface UpdateNodeCommand {
  id: string;
  name: string;
  nodeType: string; // API expects string name (e.g., "Room", "Corridor", "Elevator")
  x: number;
  y: number;
  floorId: string;
  qrCode?: string;
}

