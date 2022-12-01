export interface DetailedSegment {
  id: number;
  resource_state: number;
  name: string;
  activity_type: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  elevation_profile: string;
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: false;
  hazardous: false;
  starred: false;
  created_at: string;
  updated_at: string;
  total_elevation_gain: number;
  map: {
    id: string;
    polyline: string;
    resource_state: number;
  };
  effort_count: number;
  athlete_count: number;
  star_count: number;
  athlete_segment_stats: {
    pr_elapsed_time: null;
    pr_date: null;
    pr_activity_id: null;
    effort_count: number;
  };
  xoms: {
    kom: string;
    qom: string;
    overall: string;
    destination: {
      href: "strava://segments/13390565/leaderboard";
      type: "overall";
      name: "All-Time";
    };
  };
  local_legend: {
    athlete_id: number;
    title: string;
    profile: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/36130674/13206024/2/large.jpg";
    effort_description: string;
    effort_count: string;
    effort_counts: {
      overall: string;
      female: string;
    };
    destination: string;
  };
}
