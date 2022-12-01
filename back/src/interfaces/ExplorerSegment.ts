export interface ExplorerSegment {
  id: number;
  resource_state: number;
  name: string;
  climb_category: number;
  climb_category_desc: string;
  avg_grade: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  elev_difference: number;
  distance: number;
  points: string;
  starred: boolean;
  elevation_profile: string;
  local_legend_enabled: boolean;
}
