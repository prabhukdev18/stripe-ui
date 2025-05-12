import { defineFunction } from "@aws-amplify/backend";

export const createPayment = defineFunction({
  name: "create-payment", // Name of the Lambda function
  entry: "./handler.ts", // Path to the handler file
  environment: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "", // Stripe secret key from environment variables
  },
});