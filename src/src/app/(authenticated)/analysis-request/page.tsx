"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "../property-details/property-details.css";
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

/** A "Similar Deals" / "Recent Sales" entry as the backend maps it for the report screen. */
type Comparable = {
  buildingName?: string;
  area?: string;
  bedrooms?: string;
  sizeDisplay?: string;
  listedPriceDisplay?: string;
  salePriceDisplay?: string;
  pricePerSqftDisplay?: string;
  listingUrl?: string;
  transactionDate?: string;
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

const areaOptions = [
  "Abu Hail",
  "Al Asbaq",
  "AL Athbah",
  "Al Aweer First",
  "Al Aweer Second",
  "Al Baagh",
  "Al Bada",
  "Al Baharna",
  "Al Baraha",
  "Al Barsha",
  "Al Barsha First",
  "Al Barsha Second",
  "Al Barsha Third",
  "Al Barshaa South First",
  "Al Barshaa South Second",
  "Al Barshaa South Third",
  "Al Barsha South Fourth",
  "Al Barsha South Fifth",
  "Al Buteen",
  "Al Dhagaya",
  "Al Eyas",
  "Al Faga'A",
  "Al Fahidi",
  "Al Garhoud",
  "Al Goze First",
  "Al Goze Third",
  "Al Goze Fourth",
  "Al Goze Industrial First",
  "Al Goze Industrial Second",
  "Al Goze Industrial Third",
  "Al Goze Industrial Fourth",
  "Al Hamriya",
  "Al Hamriya Port",
  "Al Hathmah",
  "Al Hebiah First",
  "Al Hebiah Second",
  "Al Hebiah Third",
  "Al Hebiah Fourth",
  "Al Hebiah Fifth",
  "Al Hebiah Sixth",
  "Al Hudaiba",
  "Al Jadaf",
  "Al Jafliya",
  "Al Karama",
  "Al Khabeesi",
  "Al Khairan First",
  "Al Khairan  Second",
  "Al Khawaneej",
  "Al Khawaneej First",
  "Al Khawaneej Second",
  "Al Kheeran",
  "Al Kifaf",
  "Al Layan1",
  "Al Layan 2",
  "Al Lusaily",
  "Al Maha",
  "Al Mamzer",
  "Al Manara",
  "Al Mararr",
  "Al Marmoom",
  "Al Merkadh",
  "Al Meryal",
  "Al Mizhar",
  "Al Mizhar First",
  "Al Mizhar Second",
  "Al Mizhar Third",
  "AL MIZHAR FOURTH",
  "Al Murqabat",
  "Al Musalla (Dubai)",
  "Al Muteena",
  "Al Nahda First",
  "Al Nahda Second",
  "Al Oshoosh",
  "Al Qoaz",
  "Al Qusais",
  "AL QUSAIS",
  "Al Qusais Industrial First",
  "Al Qusais Industrial Second",
  "Al Qusais Industrial Third",
  "Al Qusais Industrial Fourth",
  "Al Qusais Industrial Fifth",
  "Al Raffa",
  "Al Ras",
  "Al Rashidiya",
  "Al Rega",
  "Al Rowaiyah First",
  "Al Rowaiyah Second",
  "Al Rowaiyah Third",
  "Al Ruwayyah",
  "Al Sabkha",
  "Al Safaa",
  "Al Saffa First",
  "Al Saffa Second",
  "Al Safouh First",
  "Al Safouh Second",
  "Al Sanaiyya",
  "Al Satwa",
  "Al Suq Al Kabeer",
  "Al Thanyah First",
  "Al Thanyah Second",
  "Al Thanyah Third",
  "Al Thanayah Fourth",
  "Al Thanyah Fifth",
  "Al Ttay",
  "AL TWAR FIFTH",
  "Al Twar First",
  "Al Twar Second",
  "Al Twar Third",
  "Al Twar Fourth",
  "Al Waheda",
  "Al Wajehah Al Bhariyah",
  "Al Warqa First",
  "Al Warqa Second",
  "Al Warqa Third",
  "Al Warqa Fourth",
  "Al Warqa Fifth",
  "Al Warsan First",
  "Al Warsan Second",
  "Al Warsan Third",
  "Al Wasl",
  "Al Wohoosh",
  "Al Yelayiss 1",
  "Al Yelayiss 2",
  "Al Yelayiss 3",
  "Al Yelayiss 4",
  "Al Yelayiss 5",
  "Al Yufrah 1",
  "Al Yufrah 2",
  "Al Yufrah 3",
  "Al Yufrah 4",
  "Al Zaroob",
  "Al-Aweer",
  "Al-Baloosh",
  "Al-Bastakiyah",
  "Al-Cornich",
  "Al-Dzahiyyah Al-Jadeedah",
  "Almarmum First",
  "Almarmum Third",
  "Almeydan",
  "Al-Muhaisnah North",
  "Al-Murar Jadeed",
  "Al-Murar Qadeem",
  "Al-Musalla (Deira)",
  "Al-Mustashfa West",
  "Al-Nabgha",
  "Al-Nahdah",
  "Al-Nakhal",
  "Al-Qiyadah",
  "Al-Raulah",
  "Al-Riqqa East",
  "Al-Riqqa West",
  "Al-Safiyyah",
  "Al-Shumaal",
  "Al-Souq Al Kabeer (Deira)",
  "Al-Souq Al-Muqayatah",
  "Al-Tawar",
  "Al-Zarouniyyah",
  "Anakhali",
  "Bukadra",
  "Bur Dubai",
  "Burj Khalifa",
  "Burj Nahar",
  "Business Bay",
  "Cornich Deira",
  "Dubai International Airport",
  "Dubai Investment Park First",
  "Dubai Investment Park Second",
  "Emirates Hills Fourth",
  "Eyal Nasser",
  "Festival City First",
  "Ghadeer Al tair",
  "Ghadeer Barashy",
  "Grayteesah",
  "Hadaeq Sheikh Mohammed Bin Rashid",
  "Hafair",
  "Hatta",
  "Hessyan First",
  "Hessyan Second",
  "Hor Al Anz",
  "Hor Al Anz East",
  "Island 2",
  "Jabal Ali",
  "Jabal Ali First",
  "Jabal Ali Industrial First",
  "Jabal Ali Industrial Second",
  "Jabal Ali Industrial Third",
  "Jabal Ali Second",
  "Jabal Ali Third",
  "Jumeira Island 2",
  "Jumeira Island First",
  "Jumeirah",
  "Jumeirah First",
  "Jumeirah Second",
  "Jumeirah Third",
  "Le Hemaira",
  "Lehbab",
  "Lehbab First",
  "Lehbab Second",
  "Madinat Al Mataar",
  "Madinat Dubai Almelaheyah",
  "Madinat Hind 1",
  "Madinat Hind 2",
  "Madinat Hind 3",
  "Madinat Hind 4",
  "Madinat Latifa",
  "Mankhool",
  "Margham",
  "Marsa Dubai",
  "Me'Aisem First",
  "Me'Aisem Second",
  "Mena Jabal Ali",
  "Mereiyeel",
  "Mirdif",
  "Muashrah Al Bahraana",
  "Mugatrah",
  "Muhaisanah First",
  "Muhaisanah Second",
  "Muhaisanah Third",
  "Muhaisanah Fourth",
  "Muhaisanah Fifth",
  "Muhaisna",
  "Muragab",
  "Mushrif",
  "Mushrif",
  "Nad Al Hamar",
  "Nad Al Shiba",
  "Nad Al Shiba First",
  "Nad Al Shiba Second",
  "Nad Al Shiba Third",
  "Nad Al Shiba Fourth",
  "Nad Rashid",
  "Nad Shamma",
  "Nadd Hessa",
  "Naif",
  "Naif North",
  "Naif South",
  "Nazwah",
  "Oud Al Muteena",
  "OUD AL MUTEENA",
  "Oud Metha",
  "Palm Deira",
  "Palm Jabal Ali",
  "Palm Jumeirah",
  "Port Saeed",
  "Ras Al Khor",
  "Ras Al Khor Industrial First",
  "Ras Al Khor Industrial Second",
  "Ras Al Khor Industrial Third",
  "Rega Al Buteen",
  "Remah",
  "Riqat Masali",
  "Saih Aldahal",
  "Saih Alsalam",
  "Saih Shuaelah",
  "Saih Shuaib 1",
  "Saih Shuaib 2",
  "Saih Shuaib 3",
  "Saih Shuaib 4",
  "Shandagha",
  "Shandagha East",
  "Shandagha West",
  "Sikka Al Khail",
  "Sikkat Al Khail North",
  "Sikkat Al Khail South",
  "Souq Al-Lariyyah",
  "Souq Al-Tamar",
  "Souq Sikkat Al Khail",
  "Tareeq Abu Dhabi",
  "Tareeq Al Aweer",
  "Tawaa Al Sayegh",
  "Tawi Al Muraqqab",
  "Tawi Alfuqa",
  "Trade Center First",
  "Trade Center Second",
  "Um Al Sheif",
  "Um Almoameneen",
  "Um Esalay",
  "Um Hurair First",
  "Um Hurair Second",
  "Um Ramool",
  "Um Suqaim",
  "Um Suqaim First",
  "Um Suqaim Second",
  "Um Suqaim Third",
  "Umm Addamin",
  "Umm Hurair",
  "Universe Islands",
  "Wadi Al Amardi",
  "Wadi Al Safa 2",
  "Wadi Al Safa 3",
  "Wadi Al Safa 4",
  "Wadi Al Safa 5",
  "Wadi Al Safa 6",
  "Wadi Al Safa 7",
  "Warsan Fourth",
  "World Islands",
  "Yaraah",
  "Zaabeel First",
  "Zaabeel Second",
  "Zabeel East",
  "Zareeba Duviya",
];

export default function AnalysisRequestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const reportId = searchParams?.get("id");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [report, setReport] = useState<any | null>(null);
  const [tab, setTab] = useState<"listed" | "transactions">("listed");
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [features, setFeatures] = useState<string[]>([]);
  const [filesMessage, setFilesMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string } | null>(null);

  const loadReport = useCallback(async () => {
    if (!reportId) {
      setReport(null);
      setReportError("");
      setReportLoading(false);
      return;
    }
    setReportLoading(true);
    setReportError("");
    try {
      const data = await apiClient.getAnalysisRequestById(reportId);
      setReport(data);
    } catch (error: any) {
      setReportError(error?.message || "Failed to load analysis result");
    } finally {
      setReportLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (pathname === "/analysis-request") {
      loadReport();
    }
  }, [loadReport, pathname]);

  // Refresh when returning to the report (tab focus or visibility)
  useEffect(() => {
    const handleFocus = () => {
      if (pathname === "/analysis-request") {
        loadReport();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && pathname === "/analysis-request") {
        loadReport();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadReport, pathname]);

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
    "furnishing",
  ];

  const validateForm = () => {
    for (const field of requiredFields) {
      if (!formState[field]) {
        const fieldName = field.replace(/([A-Z])/g, " $1").toLowerCase();
        toast.showError(`Please fill in the ${fieldName} field.`);
        return false;
      }
    }
    if (!agreeTerms) {
      toast.showError("Please accept the Terms of Service and Privacy Policy to continue.");
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
        toast.showError("You must be logged in to submit an analysis request. Please log in and try again.");
        setIsSubmitting(false);
        return;
      }
      
      if (!userEmail) {
        toast.showError("Unable to retrieve your email. Please log out and log back in.");
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
      trackEvent("ANALYSIS_REQUEST_SUBMITTED");

      toast.showSuccess(response.message + " Thank you for choosing Rensights!");
      router.push("/dashboard");
      
      // Reset form
      setFormState(initialFormState);
      setFeatures([]);
      setFilesMessage("");
      setAgreeTerms(false);
      setCoordinates(null);
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast.showError("Failed to submit request: " + (error.message || "Please try again later."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reportId) {
    // `report.analysis` is the analysis module's payload already mapped to camelCase and
    // display-ready by the backend (AnalysisResultMapper). Render these values as they
    // arrive — nothing here recomputes a figure the module already sent.
    const analysis = report?.analysis || {};

    const text = (raw: unknown, fallback = "") => {
      const value = raw === null || raw === undefined ? "" : String(raw).trim();
      return value || fallback;
    };

    const parsePercent = (raw: string) => {
      if (!raw) return null;
      const match = raw.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : null;
    };

    const comparableDetails = (item: Comparable) =>
      [item.bedrooms, item.sizeDisplay, item.area].map((part) => text(part)).filter(Boolean).join(" • ") ||
      "N/A";

    // Header + summary. The request's own values stand in until the analysis arrives.
    const buildingName = text(analysis.buildingName, text(report?.buildingName, "Property"));
    const area = text(analysis.area, text(report?.area));
    const city = text(analysis.city, text(report?.city));
    const bedrooms = text(analysis.bedrooms, text(report?.bedrooms, "N/A"));
    const size = text(analysis.size, text(report?.size, "N/A"));
    const buildingStatusLabel = text(analysis.buildingStatus, text(report?.buildingStatus));
    const isReady = /ready|completed/i.test(buildingStatusLabel);
    const handoverLabel = buildingStatusLabel || (isReady ? "Ready" : "Off-Plan");

    // Market gap: the percentage and its "Above Market" / "Below Market" wording both come
    // from the module; the percentage is no longer derived from price-vs-market fields.
    const marketGapPercentage = text(analysis.marketGapPercentage);
    const marketGapNumber = parsePercent(marketGapPercentage);
    const marketDirectionLabel = text(analysis.marketDirectionLabel);
    const isAboveMarket = marketDirectionLabel.toLowerCase().includes("above");
    const marketDirectionWord = isAboveMarket ? "above" : "below";

    // Left empty when the module sends nothing, so the sections that only make sense with a
    // value can hide themselves instead of printing "N/A".
    const rentalYield = text(analysis.rentalYield);
    const listedPrice = text(analysis.listedPrice);
    const estimateRange = text(analysis.estimateRange);
    const potentialSavings = text(analysis.potentialSavings);
    const pricePerSqft = text(analysis.pricePerSqft);
    const marketPosition = text(analysis.marketPosition);
    const dubaiComparison = text(analysis.dubaiComparison);
    const valuationWarning = analysis.valuationWarning || null;

    // Property details. Fields the module leaves empty are dropped rather than shown blank.
    const propertyDetails = [
      { label: "Building Status:", value: buildingStatusLabel },
      { label: "Furnishing:", value: text(analysis.furnishing) },
      { label: "Developer:", value: text(analysis.developer) },
      { label: "View:", value: text(analysis.view) },
      { label: "Service Charge:", value: text(analysis.serviceCharge) },
      { label: "Nearest Landmark:", value: text(analysis.nearestLandmark) },
      { label: "Building Features:", value: text(analysis.buildingFeatures) },
    ].filter((row) => row.value !== "");

    const listingComparables: Comparable[] = Array.isArray(analysis.listingComparables)
      ? analysis.listingComparables
      : [];
    const transactionComparables: Comparable[] = Array.isArray(analysis.transactionComparables)
      ? analysis.transactionComparables
      : [];

    return (
      <div className="property-page">
        <header className="header">
          <div className="header-left">
            <button className="back-btn" onClick={() => router.push("/dashboard")}>
              ← Back
            </button>
          </div>
        </header>

        {reportLoading && (
          <div className="analysis-report-card">
            <LoadingSpinner message="Loading report..." />
          </div>
        )}

        {reportError && (
          <div className="analysis-report-card">
            <div className="analysis-report-error">{reportError}</div>
          </div>
        )}

        {!reportLoading && report && (
          <div className="property-content-grid">
            <div className="property-overview">
              <div className="property-header">
                <h1 className="property-title">{buildingName}</h1>
                <p className="property-location">
                  {area || "Location not available"}, {city || "City not available"}
                </p>
                {marketGapPercentage && (
                  <div className="discount-highlight">
                    {marketGapPercentage} {marketDirectionLabel || "Below Market Value"}
                  </div>
                )}
              </div>

              <section className="key-metrics">
                {[
                  { value: bedrooms, label: "Bedrooms" },
                  { value: size, label: "Size" },
                  { value: handoverLabel || "N/A", label: "Handover" },
                  { value: rentalYield || "N/A", label: "Rental Yield" },
                ].map((metric) => (
                  <div key={metric.label} className="metric-card">
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-label">{metric.label}</div>
                  </div>
                ))}
              </section>

              <section className="price-analysis">
                <h3>Price Analysis</h3>
                <div className="price-grid">
                  <div className="price-section">
                    <div className="price-label">Listed Price</div>
                    <div className="price-value">{listedPrice}</div>
                  </div>
                  <div className="price-section">
                    <div className="price-label">Our Estimate Range</div>
                    <div className="price-value price-estimate">{estimateRange || "N/A"}</div>
                  </div>
                  <div className="price-section">
                    <div className="price-label">Potential Savings</div>
                    <div className="price-value">
                      <span className="savings-amount">{potentialSavings || "N/A"}</span>
                    </div>
                  </div>
                  <div className="price-section">
                    <div className="price-label">Price per sq ft</div>
                    <div className="price-value">{pricePerSqft || "N/A"}</div>
                    {marketGapPercentage && (
                      <small>
                        {marketGapPercentage} {marketDirectionLabel || "below market avg"}
                      </small>
                    )}
                  </div>
                  <div className="price-section">
                    <div className="price-label">Estimated Rental Yield</div>
                    <div className="price-value">{rentalYield || "N/A"}</div>
                  </div>
                </div>
              </section>

              {propertyDetails.length > 0 && (
                <section className="property-description">
                  <h3>Property Details</h3>
                  <div className="description-card">
                    <div className="description-grid">
                      {propertyDetails.map((detail) => (
                        <DescriptionStat key={detail.label} label={detail.label} value={detail.value} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="comparison-table">
                <h3>Market Comparison</h3>
                {[
                  { label: `This Property (${bedrooms})`, value: pricePerSqft || "N/A" },
                  { label: "Listed Price", value: listedPrice || "N/A" },
                  {
                    label: "Market Position",
                    value:
                      marketPosition ||
                      (marketGapPercentage
                        ? `${marketGapPercentage} ${marketDirectionLabel || "Below Average"}`
                        : "N/A"),
                  },
                  { label: "Rental Yield", value: rentalYield || "N/A" },
                  { label: "Estimate Range", value: estimateRange || "N/A" },
                ].map((row) => (
                  <div key={row.label} className="comparison-row">
                    <span className="comparison-label">{row.label}</span>
                    <span className="comparison-value">{row.value}</span>
                  </div>
                ))}
              </section>

              <section className="investment-insights">
                <h3>Investment Insights</h3>
                {[
                  marketGapPercentage
                    ? `Property is priced ${marketGapPercentage} ${marketDirectionWord} similar units in ${area || "the area"}${isAboveMarket ? "." : ", indicating strong value opportunity."}`
                    : "",
                  marketPosition,
                  dubaiComparison,
                ]
                  .filter(Boolean)
                  .map((insight, index) => (
                    <div key={index} className="insight-item">
                      <div className="insight-icon">✓</div>
                      <p className="insight-text">{insight}</p>
                    </div>
                  ))}

                {valuationWarning && (
                  <div className="valuation-warning">
                    <div className="valuation-warning-title">
                      <span aria-hidden="true">⚠️</span> {valuationWarning.title}
                    </div>
                    {valuationWarning.message && (
                      <p className="valuation-warning-message">{valuationWarning.message}</p>
                    )}
                  </div>
                )}
              </section>

            </div>

            <div className="property-sidebar">
              <div className="sidebar-card">
                <div className="card-title">
                  <div className="card-icon">🏠</div>
                  Comparable Properties
                </div>

                <div className="subsection-tabs">
                  <button
                    className={`tab-button ${tab === "listed" ? "active" : ""}`}
                    onClick={() => setTab("listed")}
                  >
                    Similar Deals ({listingComparables.length})
                  </button>
                  <button
                    className={`tab-button ${tab === "transactions" ? "active" : ""}`}
                    onClick={() => setTab("transactions")}
                  >
                    Recent Sales ({transactionComparables.length})
                  </button>
                </div>

                <div className={`tab-content comparable-section ${tab === "listed" ? "active" : ""}`}>
                  {listingComparables.length === 0 ? (
                    <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                      No similar properties found.
                    </div>
                  ) : (
                    listingComparables.map((item: Comparable, index: number) => (
                      <ComparableCard
                        key={`listing-${index}`}
                        title={text(item.buildingName, "Property")}
                        details={comparableDetails(item)}
                        price={text(item.listedPriceDisplay, "N/A")}
                        psf={text(item.pricePerSqftDisplay, "N/A")}
                        status="Available"
                        url={text(item.listingUrl)}
                      />
                    ))
                  )}
                </div>

                <div className={`tab-content comparable-section ${tab === "transactions" ? "active" : ""}`}>
                  {transactionComparables.length === 0 ? (
                    <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                      No recent sales found.
                    </div>
                  ) : (
                    transactionComparables.map((sale: Comparable, index: number) => (
                      <ComparableCard
                        key={`sale-${index}`}
                        title={text(sale.buildingName, "Property")}
                        details={comparableDetails(sale)}
                        price={text(sale.salePriceDisplay, "N/A")}
                        psf={text(sale.pricePerSqftDisplay, "N/A")}
                        status={text(sale.transactionDate) ? `Sold ${sale.transactionDate}` : "Sold"}
                        sold
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="sidebar-card">
                <div className="card-title">
                  <div className="card-icon">⭐</div>
                  Investment Analysis
                </div>

                <div className="score-section">
                  {marketGapPercentage && (
                    <>
                      <div className="score-value">
                        {marketGapPercentage}<span> {marketDirectionLabel || "Below Market"}</span>
                      </div>
                      {marketGapNumber !== null && !isAboveMarket && (
                        <div className="score-subtitle">
                          {marketGapNumber >= 15 ? "Excellent" : marketGapNumber >= 10 ? "Good" : "Fair"} Investment
                          Opportunity
                        </div>
                      )}
                      <p>
                        Based on price analysis, market trends, location score, rental
                        potential, and liquidity in {area || "the area"} market.
                      </p>
                      <div className="score-breakdown">
                        {listedPrice && (
                          <p>
                            <strong>Listed Price:</strong> {listedPrice}
                          </p>
                        )}
                        {estimateRange && (
                          <p>
                            <strong>Market Estimate:</strong> {estimateRange}
                          </p>
                        )}
                        {potentialSavings && (
                          <p>
                            <strong>Potential Savings:</strong> {potentialSavings}
                          </p>
                        )}
                        {rentalYield && (
                          <p>
                            <strong>Rental Yield:</strong> {rentalYield}
                          </p>
                        )}
                      </div>

                      <ul className="score-components">
                        <li>
                          <span>Price vs Market</span>
                          <strong>{marketGapPercentage}</strong>
                        </li>
                        {rentalYield && (
                          <li>
                            <span>Rental Yield</span>
                            <strong>{rentalYield}</strong>
                          </li>
                        )}
                        {handoverLabel && (
                          <li>
                            <span>Building Status</span>
                            <strong>{handoverLabel}</strong>
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </div>

                {rentalYield && (
                  <div className="investment-metrics">
                    <div className="metric-box">
                      <div>{rentalYield}</div>
                      <span>Rental Yield</span>
                    </div>
                    <div className="metric-box">
                      <div>{listedPrice || "N/A"}</div>
                      <span>Listed Price</span>
                    </div>
                    <div className="metric-box wide">
                      <div>{area || "N/A"}</div>
                      <span>Location</span>
                    </div>
                  </div>
                )}

                <p className="benefits-text">
                  <strong>Key Benefits:</strong> Property located in {area || "the area"}, {city || "the city"}.
                  {isReady ? " Ready property allows immediate occupancy and rental income." : " Off-plan property offers potential for capital appreciation."}
                  {rentalYield && ` Rental yield of ${rentalYield} provides attractive returns for investors.`}
                </p>
              </div>
            </div>

            <section className="report-disclaimer">
              <h3>Disclaimer</h3>
              <p>
                This report is generated for informational and educational purposes only. Rensights.com is a data analytics
                provider, not a licensed real estate brokerage, financial advisor, or legal consultant. The &quot;Estimated
                Price&quot; and &quot;Scores&quot; provided are based on automated algorithms and third-party data; they do not
                constitute a formal appraisal or a guarantee of profit. All investments carry risk. We strongly recommend
                consulting with a licensed professional before making any financial commitments.
              </p>
              <h4>Verification Note</h4>
              <p>
                We scan external websites for pricing anomalies. We do not verify the physical condition, legal title, or
                the authenticity of the listing. Users must perform their own due diligence (physical viewing and title deed
                verification) before transferring funds to any third party.
              </p>
              <h4>No Formal Appraisal</h4>
              <p>
                The property estimates and scores provided by this platform are generated via automated machine learning
                algorithms and do not constitute a formal, legal, or professional real estate appraisal. This platform does
                not account for the physical condition, interior upgrades, or latent defects of a property.
              </p>
              <h4>Data Sources</h4>
              <p>Dubai Land Department (DLD), Bayut, and various public records.</p>
            </section>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-page-wrapper">
        <header className="header">
          <div className="header-left">
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
                <FormSelect
                  label="Area/District"
                  required
                  value={formState.area}
                  options={[
                    { value: "", label: "Select Area" },
                    // "Marsa Dubai" is the official DLD community name (kept as the
                    // submitted value so downstream data lookups still match); it is
                    // shown to users under its common name, "Dubai Marina".
                    ...areaOptions.map((area) => ({
                      value: area,
                      label: area === "Marsa Dubai" ? "Dubai Marina" : area,
                    })),
                  ]}
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
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formState.floor}
                  onChange={(value) => handleInputChange("floor", value)}
                />
                <FormInput
                  label="Total Number of Floors"
                  placeholder="45"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
                  required
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
  inputMode,
  pattern,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  className?: string;
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (type === "number") {
      const cleaned = nextValue.replace(/[^\d]/g, "");
      onChange(cleaned);
      return;
    }
    onChange(nextValue);
  };

  return (
  <div className={`form-group ${className ?? ""}`.trim()}>
    <label>
      {label} {required && <span className="required">*</span>}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      inputMode={inputMode}
      pattern={pattern}
      onChange={handleChange}
    />
  </div>
  );
};

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

const DescriptionStat = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <strong>{label}</strong>
    <br />
    <span>{typeof value === "number" ? value.toLocaleString() : value}</span>
  </div>
);

const ComparableCard = ({
  title,
  details,
  price,
  psf,
  status,
  sold,
  url,
}: {
  title: string;
  details: string;
  price: string | number;
  psf: string;
  status: string;
  sold?: boolean;
  /** Listing link, when the comparable carries one (listing comparables only). */
  url?: string;
}) => (
  <div className="similar-property">
    <div className="similar-title">
      {url ? (
        <a className="inline-link" href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      ) : (
        title
      )}
    </div>
    <div className="similar-details">{details}</div>
    <div className="similar-price-row">
      <div className="similar-price">{typeof price === "number" ? price.toLocaleString() : price}</div>
      <div className="similar-psf">{psf}</div>
    </div>
    <div className={`similar-status ${sold ? "status-sold" : "status-listed"}`.trim()}>
      {status}
    </div>
  </div>
);
