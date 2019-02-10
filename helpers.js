const trackErrors = app => {
  app.on('error', (err, ctx) => {
    console.log(err);
    /* centralized error handling:
     *   console.log error
     *   write error to log file
     *   save error and request information to database if ctx.request match condition
     *   ...
     */
  });
};

module.exports = {
  trackErrors
};
