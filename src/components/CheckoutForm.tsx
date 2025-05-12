import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load your Stripe publishable key
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY || ""); // Replace with your Stripe publishable key
if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    console.error("STRIPE_PUBLISHABLE_KEY is not defined in the environment variables.");
}

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "https://your-website.com/checkout-success", // Replace with your success URL
            },
        });

        if (error) {
            console.error(error.message);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
};

const CheckoutPage = () => {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Call the Lambda function to create a PaymentIntent
        // fetch("https://api.stripe.com/v1/payment_intents", { // Replace with your API Gateway endpoint
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ amount: 10, currency: "usd" }), // Replace with your desired amount and currency
        // })
        fetch("https://5ie2lzvjdup55eqzwv22w7kzji0cusos.lambda-url.us-east-1.on.aws/", { // Replace with your API Gateway endpoint
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 1000, currency: "usd" }), // Replace with your desired amount and currency
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
            .catch((error) => console.error("Error fetching client secret:", error));
    }, []);

    const options = {
        clientSecret,
    };
    console.log("clientSecret", clientSecret);
    return (
        <div>
            {clientSecret ? (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm />
                </Elements>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default CheckoutPage;