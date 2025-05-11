import { defineFunction } from '@aws-amplify/backend';

export const createPayment = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'create-payment',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
   environment: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  },
});