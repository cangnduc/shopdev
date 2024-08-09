const { StatusCodes, ReasonPhrases } = require("../httpStatusCode-main/httpStatusCode");
class ErorrResponse extends Error {
  constructor(message = "Server Error", status = "500", code = "Internal Server Error") {
    super(message);
    this.code = code;
    this.status = status;
  }
}
class BadRequestError extends ErorrResponse {
  constructor(message = ReasonPhrases.BAD_REQUEST, status = StatusCodes.BAD_REQUEST, code = ReasonPhrases.BAD_REQUEST) {
    super(message, status, code);
  }
}
class UnauthorizedError extends ErorrResponse {
  constructor(message, status = StatusCodes.UNAUTHORIZED, code = ReasonPhrases.UNAUTHORIZED) {
    if (!message) {
      message = ReasonPhrases.UNAUTHORIZED ? ReasonPhrases.UNAUTHORIZED : "Unauthorized, You don't have permission to access this resource";
    }
    super(message, status, code);
  }
}
class ForbiddenError extends ErorrResponse {
  constructor(message, status = StatusCodes.FORBIDDEN, code = ReasonPhrases.FORBIDDEN) {
    if (!message) {
      message = ReasonPhrases.FORBIDDEN ? ReasonPhrases.FORBIDDEN : "Forbidden, You don't have permission to access this resource";
    }
    super(message, status, code);
  }
}
class NotFoundError extends ErorrResponse {
  constructor(message = ReasonPhrases.NOT_FOUND, status = StatusCodes.NOT_FOUND, code = ReasonPhrases.NOT_FOUND) {
    super(message, status, code);
  }
}
module.exports = { ErorrResponse, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError };
