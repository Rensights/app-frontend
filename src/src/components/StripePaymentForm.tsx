"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentFormProps {
  onPaymentMethodCreated: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

function PaymentForm({
  onPaymentMethodCreated,
  onError,
  disabled,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (stripeError) {
        setError(stripeError.message || "Payment method creation failed");
        onError(stripeError.message || "Payment method creation failed");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod) {
        onPaymentMethodCreated(paymentMethod.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#333",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#dc3545",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
        {error && <div className="error-message show">{error}</div>}
      </div>

      <button
        type="submit"
        className="btn"
        disabled={!stripe || isProcessing || disabled}
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {isProcessing ? "Processing..." : "Add Payment Method"}
      </button>
    </form>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51SMUlmCasMqex534KJuqfzLCrTVoMNlUcZAmEXFsGp1nWOTPsFVNDjf4FI6B02t9YLMDS87SPHqcxnPb6Xf53CyI00kXxX7B1l";

  if (process.env.NODE_ENV === 'development') {
    console.log("StripePaymentForm rendered. Publishable key available:", !!publishableKey);
  }

  if (!publishableKey || publishableKey.length < 20) {
    return (
      <div className="error-message show">
        Stripe publishable key not configured. Please check your environment variables.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}

