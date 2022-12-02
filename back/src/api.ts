import { Router } from "express";
import got from "got";
import { loadCache, saveCache } from "./cache";
import { DetailedSegment } from "./interfaces/DetailedSegment";
import { ExplorerSegment } from "./interfaces/ExplorerSegment";

const stravaUrl = "https://www.strava.com/api/v3";
const token = process.env.LL_STRAVA_TOKEN || "not_defined";

const app = Router();

const cache = loadCache();

app.get("/date", (req, res) => {
  res.json({
    date: new Date(),
  });
});

app.get("/strava/segments/explore", (req, res) => {
  (async () => {
    try {
      const bounds = req.query.bounds as string;
      console.log("bounds: ", bounds);
      const response: { segments: ExplorerSegment[] } = await got
        .get(stravaUrl + "/segments/explore", {
          headers: {
            Authorization: "Bearer " + token,
          },
          searchParams: {
            bounds: bounds,
            activity_type: "running",
          },
        })
        .json();
      console.log("response: ", response);
      const result: DetailedSegment[] = [];
      for (const s of response.segments) {
        console.log("s: ", s);
        let ds = cache.get(s.id);
        if (ds === undefined) {
          ds = (await got
            .get(stravaUrl + `/segments/${s.id}`, {
              headers: {
                Authorization: "Bearer " + token,
              },
            })
            .json()) as DetailedSegment;
          cache.set(ds.id, ds);
        }
        result.push(ds);
      }
      saveCache(cache);
      res.json(result);
    } catch (err) {
      console.log("err: ", err);

      res.json([...cache.values()]);
    }
  })();
});

export const api = app;
