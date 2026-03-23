import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Afritex " <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email error:", error.message);
  }
};


// welcome
export const welcomeTemplate = (name) => `
  <h2>Welcome to Afritex, ${name}! </h2>
  <p>Your account has been created successfully.</p>
`;


// designer verification
export const designerVerificationTemplate = (name) => `
  <h2>Congratulations ${name}! </h2>
  <p>Your account has been verified as a designer.</p>
`;


// customer order
export const customerOrderTemplate = (name, orderId) => `
  <h2>Order Confirmed </h2>
  <p>Hello ${name}, your order #${orderId} has been placed.</p>
`;

// designer order
export const designerOrderTemplate = (name, orderId) => `
  <h2>New Order Received </h2>
  <p>Hello ${name}, you have a new order (#${orderId}).</p>
`;

// order status
export const orderStatusTemplate = (name, status) => `
  <h2>Order Update </h2>
  <p>Hello ${name}, your order status is now: <b>${status}</b></p>
`;

