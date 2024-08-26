import {defineMiddleware} from "astro:middleware";

export const onRequest = defineMiddleware(
  async function homeDocMiddleware(context, next) {
    context.locals.accountUid =
      "z6MkkEnUheepjpmhwkF7m8tVLPXAzBadPeajriaVUXYoTteJ";
    // return a Response or the result of calling `next()`
    return next();
  }
);
