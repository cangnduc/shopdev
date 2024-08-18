const googleapis = require("googleapis");
const nodemailer = require("nodemailer");
const myEmail = "workingatgems@gmail.com";
require("dotenv").config();
const sendMail = async (email, subject, message) => {
  const OAuth2 = googleapis.google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_MAIL_CLIENT_ID,
    process.env.GOOGLE_MAIL_CLIENT_SECRET,
    process.env.GOOGLE_MAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_MAIL_REFRESH_TOKEN,
  });
  const accessToken = await oauth2Client.getAccessToken();
  console.log(accessToken);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: myEmail,
      clientId: process.env.GOOGLE_MAIL_CLIENT_ID,
      clientSecret: process.env.GOOGLE_MAIL_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_MAIL_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: myEmail,
    to: email,
    subject,

    html: message,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
};
//generate html page for welcome email
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Welcome</title>
</head>
<body>
  <h1>Welcome to ShopDev</h1>
  <p>Thank you for joining us</p>
    <p>Let's start building your shop</p>
    <p>Best Regards</p>
</body>
</html>
`;

module.exports = sendMail;
