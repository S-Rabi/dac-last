import express from "express";
import nodemailer from "nodemailer";
import base64ToS3 from "nodemailer-base64-to-s3";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json({ limit: "50mb" }));
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

transporter.use(
  "compile",
  base64ToS3({
    /* optional configuration */
  })
);

const sendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

app.get("/", (req, res) => {
  res.send("Welcome to the email sending service");
});

app.post("/sendEmail", async (req, res) => {
  try {
    const attachments = req.body.attachments || [];

    const emailBody = `Phone: ${req.body.phone}\nName: ${req.body.name}\nMessage: ${req.body.text}`;

    const mailOptions = {
      from: `"DAC" <${process.env.USER}>`,
      to: req.body.to,
      subject: req.body.subject,
      text: emailBody,
      html: req.body.html,
      attachments: attachments.map((attachment) => ({
        ...attachment,
        encoding: "base64",
      })),
    };

    const result = await sendMail(mailOptions);
    if (result) {
      res.status(200).send("Email sent successfully");
    } else {
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
