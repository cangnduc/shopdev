const parser = require("ua-parser-js");

const uaparser = (req, res, next) => {
  try {
    const userAgent = req.headers["user-agent"];
    const parserResult = new parser(userAgent);
    req.ua = parserResult.getResult();
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Error parsing user agent",
    });
  }
};

module.exports = uaparser;
