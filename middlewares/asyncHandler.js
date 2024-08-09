const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const wrapAsyncRoutes = (controller) => {
  
  const controllerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller));
  
  controllerMethods.forEach((method) => {
    if (method !== "constructor" && typeof controller[method] === "function") {
          
      controller[method] = asyncHandler(controller[method]);
    }
  });
  //handle the error for not async function


  return controller;
};

module.exports = {wrapAsyncRoutes, asyncHandler};
