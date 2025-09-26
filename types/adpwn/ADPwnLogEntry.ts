export interface ADPwnLogEntry {
  id: number;
  project_uid: string;
  module_key: string;
  run_uid: string,
  log_level: string;
  event_type: string;
  message: string;
  payload: string | null;
  timestamp: string; // ISO 8601 format
}
