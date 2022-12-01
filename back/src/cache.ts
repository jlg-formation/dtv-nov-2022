import fs from "fs";
import { DetailedSegment } from "./interfaces/DetailedSegment";

const FILENAME = "./data/cache.json";

export const loadCache = () => {
  const segmentMap = new Map<number, DetailedSegment>();
  try {
    const str = fs.readFileSync(FILENAME, { encoding: "utf-8" });
    const segments: DetailedSegment[] = JSON.parse(str);

    for (const s of segments) {
      segmentMap.set(s.id, s);
    }
  } catch (err) {}
  return segmentMap;
};
export const saveCache = (cache: Map<number, DetailedSegment>) => {
  fs.writeFileSync(FILENAME, JSON.stringify([...cache.values()], undefined, 2));
};
