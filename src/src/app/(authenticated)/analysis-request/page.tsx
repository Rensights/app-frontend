"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import "../dashboard/dashboard.css";
import "./analysis-request.css";

// Dynamically import Leaflet map component to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

type FormState = {
  city: string;
  area: string;
  buildingName: string;
  listingUrl: string;
  propertyType: string;
  bedrooms: string;
  size: string;
  plotSize: string;
  floor: string;
  totalFloors: string;
  buildingStatus: string;
  condition: string;
  askingPrice: string;
  serviceCharge: string;
  handoverDate: string;
  developer: string;
  paymentPlan: string;
  view: string;
  furnishing: string;
  additionalNotes: string;
};

const initialFormState: FormState = {
  city: "",
  area: "",
  buildingName: "",
  listingUrl: "",
  propertyType: "",
  bedrooms: "",
  size: "",
  plotSize: "",
  floor: "",
  totalFloors: "",
  buildingStatus: "",
  condition: "",
  askingPrice: "",
  serviceCharge: "",
  handoverDate: "",
  developer: "",
  paymentPlan: "",
  view: "",
  furnishing: "",
  additionalNotes: "",
};

const featureOptions = [
  { id: "balcony", label: "Balcony/Terrace" },
  { id: "parking", label: "Parking Space" },
  { id: "furnished", label: "Furnished" },
  { id: "pool", label: "Swimming Pool" },
  { id: "gym", label: "Gym/Fitness Center" },
  { id: "concierge", label: "Concierge/Security" },
  { id: "beachAccess", label: "Beach Access" },
  { id: "metroAccess", label: "Metro Access" },
];

const defaultCenters = {
  dubai: { lat: 25.2048, lng: 55.2708 },
  abudhabi: { lat: 24.4539, lng: 54.3773 },
};

export default function AnalysisRequestPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [features, setFeatures] = useState<string[]>([]);
  const [filesMessage, setFilesMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string } | null>(null);

  const plotVisible = useMemo(
    () => formState.propertyType === "villa",
    [formState.propertyType]
  );

  const currentCenter = useMemo(() => {
    return defaultCenters[formState.city as keyof typeof defaultCenters] || defaultCenters.dubai;
  }, [formState.city]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoordinates({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    });
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (value: string) => {
    setFeatures((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const formatPrice = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return `AED ${Number(digits).toLocaleString()}`;
  };

  const requiredFields: Array<keyof FormState> = [
    "city",
    "area",
    "buildingName",
    "propertyType",
    "bedrooms",
    "size",
    "buildingStatus",
    "condition",
    "askingPrice",
  ];

  const validateForm = () => {
    for (const field of requiredFields) {
      if (!formState[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, " $1")} field.`);
        return false;
      }
    }
    if (!agreeTerms) {
      alert("Please accept the Terms of Service and Privacy Policy to continue.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Get email from authenticated user (user is logged in)
      let userEmail = "";
      try {
        const user = await apiClient.getCurrentUser();
        userEmail = user.email;
      } catch (e) {
        // If not authenticated, show error
        alert("You must be logged in to submit an analysis request. Please log in and try again.");
        setIsSubmitting(false);
        return;
      }
      
      if (!userEmail) {
        alert("Unable to retrieve your email. Please log out and log back in.");
        setIsSubmitting(false);
        return;
      }
      
      // Add all form fields
      formData.append('email', userEmail);
      formData.append('city', formState.city);
      formData.append('area', formState.area);
      formData.append('buildingName', formState.buildingName);
      if (formState.listingUrl) formData.append('listingUrl', formState.listingUrl);
      formData.append('propertyType', formState.propertyType);
      formData.append('bedrooms', formState.bedrooms);
      if (formState.size) formData.append('size', formState.size);
      if (formState.plotSize) formData.append('plotSize', formState.plotSize);
      if (formState.floor) formData.append('floor', formState.floor);
      if (formState.totalFloors) formData.append('totalFloors', formState.totalFloors);
      formData.append('buildingStatus', formState.buildingStatus);
      formData.append('condition', formState.condition);
      
      if (coordinates) {
        formData.append('latitude', coordinates.lat);
        formData.append('longitude', coordinates.lng);
      }
      
      formData.append('askingPrice', formState.askingPrice);
      if (formState.serviceCharge) formData.append('serviceCharge', formState.serviceCharge);
      if (formState.handoverDate) formData.append('handoverDate', formState.handoverDate);
      if (formState.developer) formData.append('developer', formState.developer);
      if (formState.paymentPlan) formData.append('paymentPlan', formState.paymentPlan);
      
      if (features.length > 0) {
        formData.append('features', JSON.stringify(features));
      }
      
      if (formState.view) formData.append('view', formState.view);
      if (formState.furnishing) formData.append('furnishing', formState.furnishing);
      if (formState.additionalNotes) formData.append('additionalNotes', formState.additionalNotes);
      
      // Add files if any
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append('files', fileInput.files[i]);
        }
      }
      
      // Submit to API
      const response = await apiClient.submitAnalysisRequest(formData);
      
      alert(
        "🎉 " + response.message + "\n\nThank you for choosing Rensights!"
      );
      
      // Reset form
      setFormState(initialFormState);
      setFeatures([]);
      setFilesMessage("");
      setAgreeTerms(false);
      setCoordinates(null);
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      alert("❌ Failed to submit request: " + (error.message || "Please try again later."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-page-wrapper">
        <header className="header">
          <div className="header-left">
            <div className="logo">Rensights</div>
            <div className="page-title">Property Price Analysis Request</div>
          </div>
          <div className="verified-badge">✓ Expert Analysis</div>
        </header>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <section className="form-section">
              <SectionHeader
                icon="🏢"
                title="Property Information"
                description="Basic information about the property you'd like us to analyze in the UAE"
              />
              <div className="form-grid">
                <FormSelect
                  label="City"
                  required
                  value={formState.city}
                  options={[
                    { value: "", label: "Select City" },
                    { value: "dubai", label: "Dubai" },
                  ]}
                  onChange={(value) => handleInputChange("city", value)}
                />
                <FormInput
                  label="Area/District"
                  placeholder="e.g., Dubai Marina, Downtown Dubai, Corniche"
                  required
                  value={formState.area}
                  onChange={(value) => handleInputChange("area", value)}
                />
                <FormInput
                  label="Building/Project Name"
                  placeholder="e.g., Marina Pinnacle Tower"
                  required
                  className="full-width"
                  value={formState.buildingName}
                  onChange={(value) => handleInputChange("buildingName", value)}
                />
                <FormInput
                  label="Property Listing URL"
                  placeholder="https://www.bayut.com/property/12345"
                  value={formState.listingUrl}
                  onChange={(value) => handleInputChange("listingUrl", value)}
                  className="full-width"
                />
                <FormSelect
                  label="Property Type"
                  required
                  value={formState.propertyType}
                  options={[
                    { value: "", label: "Select Type" },
                    { value: "apartment", label: "Apartment" },
                    { value: "villa", label: "Villa" },
                    { value: "townhouse", label: "Townhouse" },
                  ]}
                  onChange={(value) => handleInputChange("propertyType", value)}
                />
                <FormSelect
                  label="Bedrooms"
                  required
                  value={formState.bedrooms}
                  options={[
                    { value: "", label: "Select" },
                    { value: "studio", label: "Studio" },
                    { value: "1", label: "1 Bedroom" },
                    { value: "2", label: "2 Bedrooms" },
                    { value: "3", label: "3 Bedrooms" },
                    { value: "4", label: "4 Bedrooms" },
                    { value: "5+", label: "5+ Bedrooms" },
                  ]}
                  onChange={(value) => handleInputChange("bedrooms", value)}
                />
                <FormInput
                  label="Property Size (sq ft)"
                  placeholder="750"
                  type="number"
                  required
                  value={formState.size}
                  onChange={(value) => handleInputChange("size", value)}
                />
              </div>

              {plotVisible && (
                <div className="form-grid">
                  <FormInput
                    label="Plot Size (sq ft)"
                    placeholder="2500"
                    type="number"
                    value={formState.plotSize}
                    onChange={(value) => handleInputChange("plotSize", value)}
                  />
                </div>
              )}

              <div className="form-grid">
                <FormInput
                  label="Floor Number"
                  placeholder="e.g., 28"
                  value={formState.floor}
                  onChange={(value) => handleInputChange("floor", value)}
                />
                <FormInput
                  label="Total Number of Floors"
                  placeholder="45"
                  type="number"
                  value={formState.totalFloors}
                  onChange={(value) => handleInputChange("totalFloors", value)}
                />
                <FormSelect
                  label="Building Status"
                  required
                  value={formState.buildingStatus}
                  options={[
                    { value: "", label: "Select Status" },
                    { value: "ready", label: "Ready to Move" },
                    { value: "off-plan", label: "Off-Plan" },
                  ]}
                  onChange={(value) => handleInputChange("buildingStatus", value)}
                />
                <FormSelect
                  label="Property Condition"
                  required
                  value={formState.condition}
                  options={[
                    { value: "", label: "Select Condition" },
                    { value: "excellent", label: "Excellent" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                    { value: "needs-renovation", label: "Needs Renovation" },
                  ]}
                  onChange={(value) => handleInputChange("condition", value)}
                />
              </div>

              <div className="form-group">
                <label>
                  Property Location <span className="optional">(optional)</span>
                </label>
                <div className="location-help">
                  💡 <strong>Tip:</strong> Click on the map to mark your
                  property&apos;s exact location. This helps us provide more
                  accurate pricing analysis based on the specific area.
                </div>
                <div id="map" ref={mapRef} style={{ minHeight: '300px', width: '100%' }} />
                {typeof window !== 'undefined' && (
                  <MapComponent
                    mapRef={mapRef}
                    center={currentCenter}
                    onLocationSelect={handleLocationSelect}
                    coordinates={coordinates}
                  />
                )}
                {coordinates && (
                  <div className="location-display">
                    <strong>Selected Location:</strong>{" "}
                    {coordinates.lat}, {coordinates.lng}
                  </div>
                )}
              </div>
            </section>

            <section className="form-section">
              <SectionHeader
                icon="💰"
                title="Financial Information"
                description="Pricing and financial details to help us provide accurate analysis in AED"
              />
              <div className="form-grid">
                <FormInput
                  label="Current Asking Price"
                  placeholder="AED 1,450,000"
                  required
                  value={formState.askingPrice}
                  onChange={(value) =>
                    handleInputChange("askingPrice", formatPrice(value))
                  }
                />
                <FormInput
                  label="Annual Service Charge"
                  placeholder="AED 18,000"
                  value={formState.serviceCharge}
                  onChange={(value) =>
                    handleInputChange("serviceCharge", formatPrice(value))
                  }
                />
                <FormInput
                  label="Expected Handover Date"
                  placeholder="Q2 2024 or Ready to Move"
                  value={formState.handoverDate}
                  onChange={(value) => handleInputChange("handoverDate", value)}
                />
                <FormInput
                  label="Developer"
                  placeholder="e.g., Emaar, DAMAC, Nakheel"
                  value={formState.developer}
                  onChange={(value) => handleInputChange("developer", value)}
                />
                <FormSelect
                  label="Payment Plan"
                  value={formState.paymentPlan}
                  options={[
                    { value: "", label: "Select" },
                    { value: "cash", label: "Cash Payment" },
                    { value: "mortgage", label: "Bank Mortgage" },
                    { value: "developer-plan", label: "Developer Payment Plan" },
                    { value: "mixed", label: "Mixed Payment" },
                  ]}
                  onChange={(value) => handleInputChange("paymentPlan", value)}
                />
              </div>
              <InfoCard
                title="💡 Why we need this information"
                text="Pricing information helps our analysis compare your property with similar listings and recent sales in the UAE market. This data is kept confidential and used solely for your price analysis report."
              />
            </section>

            <section className="form-section">
              <SectionHeader
                icon="🏠"
                title="Additional Property Details"
                description="Optional details that will improve the accuracy of our analysis"
              />
              <div className="form-group">
                <label>Property Features</label>
                <div className="checkbox-group">
                  {featureOptions.map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      className={`checkbox-item ${
                        features.includes(feature.id) ? "checked" : ""
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={features.includes(feature.id)}
                      />
                      <span>{feature.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <FormSelect
                  label="View Type"
                  value={formState.view}
                  options={[
                    { value: "", label: "Select" },
                    { value: "marina", label: "Marina View" },
                    { value: "sea", label: "Sea/Beach View" },
                    { value: "city", label: "City/Skyline View" },
                    { value: "golf", label: "Golf Course View" },
                    { value: "park", label: "Park/Garden View" },
                    { value: "canal", label: "Canal View" },
                    { value: "burj", label: "Burj Khalifa View" },
                    { value: "courtyard", label: "Courtyard View" },
                    { value: "road", label: "Road View" },
                  ]}
                  onChange={(value) => handleInputChange("view", value)}
                />
                <FormSelect
                  label="Furnishing Status"
                  value={formState.furnishing}
                  options={[
                    { value: "", label: "Select" },
                    { value: "unfurnished", label: "Unfurnished" },
                    { value: "semi-furnished", label: "Semi-Furnished" },
                    { value: "fully-furnished", label: "Fully Furnished" },
                  ]}
                  onChange={(value) => handleInputChange("furnishing", value)}
                />
              </div>
              <FormTextArea
                label="Additional Notes"
                placeholder="Any specific details about the property, recent renovations, unique features, or questions you'd like us to address..."
                value={formState.additionalNotes}
                onChange={(value) => handleInputChange("additionalNotes", value)}
              />
              <div className="form-group">
                <label>
                  Property Images/Documents <span className="optional">(optional)</span>
                </label>
                <div
                  className="file-upload"
                  onClick={() =>
                    document.getElementById("fileInput")?.click()
                  }
                >
                  <div className="file-upload-icon">📎</div>
                  <div className="file-upload-text">
                    {filesMessage || "Click to upload files"}
                  </div>
                  <div className="file-upload-hint">
                    Property photos, floor plans, or listing screenshots
                  </div>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={(event) => {
                    const files = event.target.files;
                    if (!files || !files.length) {
                      setFilesMessage("");
                      return;
                    }
                    // Mobile-friendly file handling
                    const fileArray = Array.from(files);
                    setFilesMessage(
                      fileArray.length === 1
                        ? `${fileArray[0].name} selected`
                        : `${fileArray.length} files selected`
                    );
                  }}
                  capture="environment"
                />
              </div>
            </section>

            <div className="timeline-estimate">
              <div className="timeline-title">⏱️ Expected Delivery Time</div>
              <div className="timeline-text">
                Your comprehensive price analysis report will be ready within
                24-48 hours
              </div>
            </div>

            <InfoCard
              title="📧 What happens next?"
              text="1. Our experts will analyze your property against similar listings and recent sales in the UAE market
2. Property specialists will review the findings and market trends
3. You'll receive a detailed PDF report via email
4. The report will include price estimates, market comparisons, and investment insights"
            />

            <div className="submit-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "⏳ Submitting..." : "🚀 Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) => (
  <div className={`form-group ${className ?? ""}`.trim()}>
    <label>
      {label} {required && <span className="required">*</span>}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const FormSelect = ({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}) => (
  <div className="form-group">
    <label>
      {label} {required && <span className="required">*</span>}
    </label>
    <select
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const FormTextArea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div className="form-group">
    <label>{label}</label>
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const SectionHeader = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="section-header">
    <div className="section-icon">{icon}</div>
    <div>
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
    </div>
  </div>
);

const InfoCard = ({ title, text }: { title: string; text: string }) => (
  <div className="info-card">
    <div className="info-card-title">{title}</div>
    <div className="info-card-text">
      {text.split("\n").map((row, index) => (
        <p key={index}>{row}</p>
      ))}
    </div>
  </div>
);

