/**
 * API Module - Barrel Export
 * 
 * Export all API services and types for easy importing.
 * Usage: import { buildingsApi, NodeDto, ... } from '@/api';
 */

// Types
export * from './types';

// API Client
export { apiClient } from './client';

// API Services
export { buildingsApi, BuildingsApiService } from './buildings.api';
export { floorsApi, FloorsApiService } from './floors.api';
export { nodesApi, NodesApiService } from './nodes.api';
export { edgesApi, EdgesApiService } from './edges.api';
export { routesApi, RoutesApiService } from './routes.api';
