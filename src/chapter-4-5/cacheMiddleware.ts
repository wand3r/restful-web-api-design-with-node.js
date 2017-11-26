import { RequestHandler } from "express-serve-static-core";

const CacheControlHeader = "Cache-Control";

export const cache: (
  cacheDurationInSeconds: number,
) => RequestHandler = cacheDurationInSeconds => (req, res, next) => {
  if (cacheDurationInSeconds < 0)
    throw new Error("Cache duration must be positive number");
  else if (cacheDurationInSeconds === 0)
    res.setHeader(CacheControlHeader, "no-cache");
  else
    res.setHeader(
      CacheControlHeader,
      `max-age=${cacheDurationInSeconds}, must-revalidate`,
    );
  next();
};
