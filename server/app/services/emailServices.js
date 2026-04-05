const nodemailer = require("nodemailer");

const sendLoginEmail = async (email, loginURL) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
const loginURL = `${process.env.FRONTEND_URL}/login`;
console.log("Login URL:", loginURL);
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Login to Your Account",
    html: `
      <h2>Welcome 🎉</h2>
      <p>Your email has been verified successfully.</p>
      <a href="${loginURL}" style="
        padding:10px 20px;
        background:#007bff;
        color:white;
        text-decoration:none;
        border-radius:5px;
      ">
        Login Now
      </a>
    `,
  };

  await transporter.sendMail(mailOptions);
};