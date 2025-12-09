"use client";

import { useMemo, useState } from "react";
import "./early-access.css";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  budget: string;
  portfolio: string;
  timeline: string;
  targetRegions: string;
  challenges: string;
  valuableServices: string;
};

const initialFormState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  experience: "",
  budget: "",
  portfolio: "",
  timeline: "",
  targetRegions: "",
  challenges: "",
  valuableServices: "",
};

const goalOptions = [
  "Rental Income",
  "Capital Appreciation",
  "Portfolio Diversification",
  "Lifestyle Investment",
];

const propertyTypeOptions = [
  "Residential",
  "Commercial",
  "Vacation Rentals",
  "Development Projects",
];

export default function EarlyAccessPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [goals, setGoals] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const disableSubmit = useMemo(
    () => !formState.fullName || !formState.email || !formState.location,
    [formState]
  );

  const toggleSelection = (
    value: string,
    state: string[],
    setter: (next: string[]) => void
  ) => {
    setter(
      state.includes(value)
        ? state.filter((item) => item !== value)
        : [...state, value]
    );
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formState.fullName || !formState.email || !formState.location) {
      setShowErrorMessage(true);
      return false;
    }
    if (!formState.experience || !formState.budget || !formState.timeline) {
      setShowErrorMessage(true);
      return false;
    }
    if (goals.length === 0 || propertyTypes.length === 0) {
      setShowErrorMessage(true);
      return false;
    }
    setShowErrorMessage(false);
    return true;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      setFormState(initialFormState);
      setGoals([]);
      setPropertyTypes([]);
    }, 1500);
  };

  return (
    <div className="early-access-page">
      <div className="circle circle1" />
      <div className="circle circle2" />
      <div className="circle circle3" />

      <div className="container">
        <header className="header">
          <h1>Get Early Access to Premium Package &quot;Trusted Advisor&quot;</h1>
          <p>
            We will support you in identifying attractive investment
            opportunities, coordinating with owners and agents so you don&apos;t
            have to, helping in determining and negotiating offers, and guiding
            you through every step of your international real estate investment
            journey. Request access now and be a pioneer!
          </p>
        </header>

        <div className="form-container">
          {showErrorMessage && (
            <div className="message error-message">
              Please complete all required fields and select at least one goal
              and property type.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <section className="form-section">
              <h2 className="section-title">Contact Information</h2>
              <div className="form-grid">
                <FormInput
                  label="Full Name"
                  required
                  value={formState.fullName}
                  onChange={(value) => handleInputChange("fullName", value)}
                />
                <FormInput
                  label="Email Address"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(value) => handleInputChange("email", value)}
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  value={formState.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                />
                <FormInput
                  label="Current Location/Country"
                  required
                  value={formState.location}
                  onChange={(value) => handleInputChange("location", value)}
                />
              </div>
            </section>

            <section className="form-section">
              <h2 className="section-title">Investment Profile</h2>
              <div className="form-grid">
                <FormSelect
                  label="Investment Experience Level"
                  required
                  value={formState.experience}
                  options={[
                    "",
                    "Beginner",
                    "Intermediate",
                    "Experienced",
                  ]}
                  onChange={(value) => handleInputChange("experience", value)}
                />
                <FormSelect
                  label="Investment Budget Range"
                  required
                  value={formState.budget}
                  options={[
                    "",
                    "$50K-$100K",
                    "$100K-$250K",
                    "$250K-$500K",
                    "$500K-$1M",
                    "$1M+",
                  ]}
                  onChange={(value) => handleInputChange("budget", value)}
                />
                <FormSelect
                  label="Current Portfolio Size"
                  value={formState.portfolio}
                  options={[
                    "",
                    "No properties",
                    "1-2 properties",
                    "3-5 properties",
                    "6-10 properties",
                    "10+ properties",
                  ]}
                  onChange={(value) => handleInputChange("portfolio", value)}
                />
                <FormSelect
                  label="Investment Timeline"
                  required
                  value={formState.timeline}
                  options={[
                    "",
                    "Immediately",
                    "3-6 months",
                    "6-12 months",
                    "Just exploring",
                  ]}
                  onChange={(value) => handleInputChange("timeline", value)}
                />
                <div className="form-group full-width">
                  <label className="required-label">
                    Primary Investment Goals
                  </label>
                  <div className="checkbox-group">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className={`checkbox-item ${
                          goals.includes(goal) ? "checked" : ""
                        }`}
                        onClick={() =>
                          toggleSelection(goal, goals, setGoals)
                        }
                      >
                        <input
                          type="checkbox"
                          checked={goals.includes(goal)}
                          readOnly
                        />
                        <span>{goal}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="section-title">Investment Preferences</h2>
              <div className="form-group">
                <label className="required-label">
                  Target Countries/Regions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Spain, Portugal, Dubai, Thailand"
                  value={formState.targetRegions}
                  onChange={(event) =>
                    handleInputChange("targetRegions", event.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="required-label">Property Types of Interest</label>
                <div className="checkbox-group">
                  {propertyTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`checkbox-item ${
                        propertyTypes.includes(type) ? "checked" : ""
                      }`}
                      onClick={() =>
                        toggleSelection(type, propertyTypes, setPropertyTypes)
                      }
                    >
                      <input
                        type="checkbox"
                        checked={propertyTypes.includes(type)}
                        readOnly
                      />
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="section-title">Additional Information</h2>
              <div className="form-group">
                <label>Biggest Challenges in International Real Estate</label>
                <textarea
                  placeholder="Tell us about any challenges you've faced or concerns you have..."
                  value={formState.challenges}
                  onChange={(event) =>
                    handleInputChange("challenges", event.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>What are you looking for in this product?</label>
                <textarea
                  placeholder="What features or services would be most valuable to you?"
                  value={formState.valuableServices}
                  onChange={(event) =>
                    handleInputChange("valuableServices", event.target.value)
                  }
                />
              </div>
            </section>

            <div className="submit-section">
              <button
                type="submit"
                className="submit-button"
                disabled={disableSubmit || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Join Early Access"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay show" onClick={() => setShowSuccessModal(false)}>
          <div
            className="success-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>You&apos;re on the list!</h2>
            <p>
              Thank you for joining our early access program. We&apos;ll send you
              an email soon with exclusive updates and your priority access
              details.
            </p>
            <button type="button" onClick={() => setShowSuccessModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type InputProps = {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
};

const FormInput = ({
  label,
  required,
  type = "text",
  value,
  onChange,
}: InputProps) => (
  <div className="form-group">
    <label className={required ? "required-label" : undefined}>{label}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const FormSelect = ({
  label,
  required,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div className="form-group">
    <label className={required ? "required-label" : undefined}>{label}</label>
    <select
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option || "Select an option"}
        </option>
      ))}
    </select>
  </div>
);

