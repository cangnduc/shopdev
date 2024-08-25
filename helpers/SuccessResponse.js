class SuccessResponse {
  constructor({ message = "Success", data = {}, status = "ok", code = 200 }) {
    this.message = message;
    this.data = data;
    this.status = status;
    this.code = code;
  }
  send(res) {
    return res.status(this.code).json({
      message: this.message,
      data: this.data,
      status: this.status,
    });
  }
}

module.exports = SuccessResponse;
