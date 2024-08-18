const {
  StatusCodes,
  ReasonPhrases,
} = require("../httpStatusCode-main/httpStatusCode");
class ErorrResponse extends Error {
  constructor(message = "Server Error", status = "Error", code = "400") {
    super(message);
    this.code = code;
    this.status = status;
  }
}
class BadRequestError extends ErorrResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    status = ReasonPhrases.BAD_REQUEST,
    code = StatusCodes.BAD_REQUEST
  ) {
    super(message, status, code);
  }
}
class UnauthorizedError extends ErorrResponse {
  constructor(
    message,
    status = ReasonPhrases.UNAUTHORIZED,
    code = StatusCodes.UNAUTHORIZED
  ) {
    if (!message) {
      message = ReasonPhrases.UNAUTHORIZED
        ? ReasonPhrases.UNAUTHORIZED
        : "Unauthorized, You don't have permission to access this resource";
    }
    super(message, status, code);
  }
}
class ForbiddenError extends ErorrResponse {
  constructor(
    message,
    status = ReasonPhrases.FORBIDDEN,
    code = StatusCodes.FORBIDDEN
  ) {
    if (!message) {
      message = ReasonPhrases.FORBIDDEN
        ? ReasonPhrases.FORBIDDEN
        : "Forbidden, You don't have permission to access this resource";
    }
    super(message, status, code);
  }
}
class NotFoundError extends ErorrResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    status = ReasonPhrases.NOT_FOUND,
    code = StatusCodes.NOT_FOUND
  ) {
    super(message, status, code);
  }
}
module.exports = {
  ErorrResponse,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
