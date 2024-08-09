class SuccessResponse {
  constructor({ message="Success", data={}, status="200" , code="Success", options={} }) {
    this.message = message;
    this.data = data;
    this.status = status;
    this.code = code;
    this.options = options;
   
  }
  send(res) {
    return res.status(this.status).json({
      message: this.message,
      data: this.data,
      code: this.code,
      options: this.options
    });
  }
}

module.exports = SuccessResponse;