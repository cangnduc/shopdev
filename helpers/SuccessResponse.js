class SuccessResponse {
  constructor({
    message = "Success",
    data = {},
    status = 200,
    code = "Success",
  }) {
    this.message = message;
    this.data = data;
    this.status = status;
    this.code = code;
  }
  send(res) {
    return res.status(this.status).json({
      message: this.message,
      data: this.data,
      code: this.code,
    });
  }
}

module.exports = SuccessResponse;
