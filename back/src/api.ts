import { Router } from "express";
import got from "got";

const stravaUrl = "https://www.strava.com/api/v3";
const token = process.env.LL_STRAVA_TOKEN || "not_defined";

const app = Router();

app.get("/date", (req, res) => {
  res.json({
    date: new Date(),
  });
});

app.get("/strava/segments/explore", (req, res) => {
  (async () => {
    try {
      const response = await got
        .get(stravaUrl + "/segments/explore", {
          headers: {
            Authorization: "Bearer " + token,
          },
          searchParams: {
            bounds: "0,0,10,10",
          },
        })
        .json();
      console.log("response: ", response);
      res.json(response);
    } catch (err) {
      console.log("err: ", err);
      res.status(500).end();
    }
  })();
});

export const api = app;
