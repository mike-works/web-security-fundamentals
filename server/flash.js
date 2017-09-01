const flash = require('connect-flash')();

function flashMiddleware(request, response, next) {
  flash(request, response, function () {
    let { render } = response;
    response.render = function () {
      response.locals.messages = request.flash();
      render.apply(response, [...arguments]);
    }
    next();
  });
}

module.exports = {
  flashMiddleware
};