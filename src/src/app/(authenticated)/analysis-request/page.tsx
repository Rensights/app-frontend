"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import "../dashboard/dashboard.css";
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

  useEffect(() => {
    if (!reportId) {
      return;
    }
    const loadReport = async () => {
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
    };
    loadReport();
  }, [reportId]);

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
      
      toast.showSuccess(response.message + " Thank you for choosing Rensights!");
      if (response.requestId) {
        router.push(`/analysis-request?id=${response.requestId}`);
      }
      
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
    const getAnalysisValue = (keys: string[]) => {
      if (!report?.analysisResult) return null;
      for (const key of keys) {
        const value = report.analysisResult[key];
        if (value !== undefined && value !== null && value !== "") {
          return value;
        }
      }
      return null;
    };

    const parseJsonArray = (value: any) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const parseNumber = (value: any) => {
      if (value === null || value === undefined) return null;
      const cleaned = String(value).replace(/[^0-9.]/g, "");
      if (!cleaned) return null;
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : null;
    };

    const parsePercent = (value: any) => {
      if (!value) return null;
      const match = String(value).match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : null;
    };

    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === "") return "N/A";
      return String(value);
    };

    const analysis = report?.analysisResult || {};
    const listedPriceRaw = getAnalysisValue(["listed_price_aed", "listedPriceAed", "listed_price"]);
    const listedPriceNum = parseNumber(listedPriceRaw);
    const listedPrice = listedPriceRaw
      ? String(listedPriceRaw).includes("AED")
        ? String(listedPriceRaw)
        : `AED ${listedPriceRaw}`
      : "N/A";
    const sizeSqft = getAnalysisValue(["size_sqft", "sizeSqft"]);
    const sizeNum = parseNumber(sizeSqft);
    const pricePerSqftRaw = getAnalysisValue(["price_per_sqft", "pricePerSqft"]);
    const pricePerSqftNum = parseNumber(pricePerSqftRaw);
    const pricePerSqft = pricePerSqftNum || (listedPriceNum && sizeNum ? listedPriceNum / sizeNum : 0);
    const estimateRange = getAnalysisValue(["our_price_estimate", "ourPriceEstimate"]);
    const priceVsEstimations = getAnalysisValue(["price_vs_estimations", "priceVsEstimations"]);
    const potentialSavings = getAnalysisValue(["potential_savings", "potentialSavings"]);
    const savingsNumbers = potentialSavings ? String(potentialSavings).match(/[\d,.]+/g) : null;
    const savingsMin = savingsNumbers && savingsNumbers.length >= 1 ? parseNumber(savingsNumbers[0]) : null;
    const savingsMax = savingsNumbers && savingsNumbers.length >= 2 ? parseNumber(savingsNumbers[1]) : null;
    const discountPercent = parsePercent(getAnalysisValue(["price_per_sqft_vs_market", "pricePerSqftVsMarket", "price_vs_estimations", "priceVsEstimations"]));
    const rentalYield = getAnalysisValue(["rental_yield_estimate", "rentalYieldEstimate", "gross_rental_yield", "grossRentalYield"]);
    const buildingStatusRaw = getAnalysisValue(["building_status", "buildingStatus"]) || report?.buildingStatus || "";
    const buildingStatus = /ready|completed/i.test(String(buildingStatusRaw)) ? "READY" : "OFFPLAN";
    const listingComparables = parseJsonArray(getAnalysisValue(["listing_comparables", "listingComparables"]));
    const transactionComparables = parseJsonArray(getAnalysisValue(["transaction_comparables", "transactionComparables"]));

    return (
      <div className="property-page">
        <header className="header">
          <div className="header-left">
            <button className="back-btn" onClick={() => router.push("/dashboard")}>
              ← Back to Deals
            </button>
          </div>
        </header>

        {reportLoading && (
          <div className="analysis-report-card">
            <div className="analysis-report-loading">Loading report...</div>
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
                <h1 className="property-title">{analysis.building_name || report.buildingName || "Property"}</h1>
                <p className="property-location">
                  {analysis.area || report.area || "Location not available"}, {analysis.city || report.city || "City not available"}
                </p>
                {discountPercent !== null && (
                  <div className="discount-highlight">
                    {discountPercent}% Below Market Value
                  </div>
                )}
              </div>

              <section className="key-metrics">
                {[
                  { value: analysis.bedrooms || report.bedrooms || "N/A", label: "Bedrooms" },
                  { value: sizeSqft || report.size || "N/A", label: "Size" },
                  { value: buildingStatus === "READY" ? "Ready" : "Off-Plan", label: "Handover" },
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
                    <div className="price-value price-estimate">
                      {estimateRange || "N/A"}
                    </div>
                  </div>
                  {savingsMin && savingsMax && (
                    <div className="price-section">
                      <div className="price-label">Potential Savings</div>
                      <div className="price-value">
                        <span className="savings-amount">
                          AED {Math.round(savingsMin).toLocaleString()} - {Math.round(savingsMax).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="price-section">
                    <div className="price-label">Price per sq ft</div>
                    <div className="price-value">
                      {pricePerSqft > 0
                        ? `AED ${pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} /sq ft`
                        : "N/A"}
                    </div>
                    {discountPercent !== null && <small>{discountPercent}% below market avg</small>}
                  </div>
                </div>
              </section>

              <section className="property-description">
                <h3>Property Description</h3>
                <div className="description-card">
                  <p>
                    {analysis.property_description ||
                      `This ${analysis.bedrooms || "property"} offers living in the heart of ${analysis.area || "the area"}. The unit features an efficient layout that maximizes the ${sizeSqft || "available"} space. The property is located in ${analysis.area || "the"} area of ${analysis.city || "the city"}.`}
                  </p>
                  <div className="description-grid">
                    <DescriptionStat
                      label="Price per sq ft:"
                      value={pricePerSqft > 0
                        ? `AED ${pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft`
                        : "N/A"}
                    />
                    <DescriptionStat
                      label="Building Status:"
                      value={buildingStatus === "READY" ? "Ready" : "Off-Plan"}
                    />
                    <DescriptionStat
                      label="Listed Price:"
                      value={listedPrice}
                    />
                    <DescriptionStat label="Rental Yield:" value={rentalYield || "N/A"} />
                  </div>
                  <div className="description-footer">
                    <button className="inline-link" type="button">
                      View the Property
                    </button>
                  </div>
                </div>
              </section>

              <section className="comparison-table">
                <h3>Market Comparison</h3>
                {[
                  {
                    label: `This Property (${analysis.bedrooms || report.bedrooms || "N/A"})`,
                    value: pricePerSqft > 0
                      ? `AED ${pricePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft`
                      : "N/A",
                  },
                  { label: "Listed Price", value: listedPrice },
                  { label: "Market Position", value: analysis.market_position || (discountPercent !== null ? `${discountPercent}% Below Average` : "N/A") },
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
                  `Property is priced ${discountPercent !== null ? `${discountPercent}%` : ""} below similar units in ${analysis.area || "the area"}, indicating strong value opportunity.`,
                  `${analysis.market_position || "Strong market position for this unit."}`,
                  `${analysis.investment_appeal || "Investment appeal is favorable based on current market conditions."}`,
                  `${analysis.dubai_comparison || "Market comparison data is still being compiled."}`,
                ].map((text, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-icon">✓</div>
                    <p className="insight-text">{text}</p>
                  </div>
                ))}
              </section>

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
                    listingComparables.map((item: any, index: number) => {
                      const itemSize = parseNumber(item.sqft || item.size) || 0;
                      const itemPrice = parseNumber(item.price) || 0;
                      const psf = itemSize > 0 && itemPrice > 0 ? itemPrice / itemSize : 0;
                      return (
                        <ComparableCard
                          key={`listing-${index}`}
                          title={item.building || item.name || "Property"}
                          details={`${analysis.bedrooms || "N/A"} • ${itemSize ? `${itemSize} sqft` : "N/A"} • ${analysis.area || "N/A"}`}
                          price={item.price || "N/A"}
                          psf={psf > 0 ? `AED ${psf.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft` : "N/A"}
                          status="Available"
                        />
                      );
                    })
                  )}
                </div>

                <div className={`tab-content comparable-section ${tab === "transactions" ? "active" : ""}`}>
                  {transactionComparables.length === 0 ? (
                    <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                      No recent sales found.
                    </div>
                  ) : (
                    transactionComparables.map((sale: any, index: number) => {
                      const saleSize = parseNumber(sale.sqft || sale.size) || 0;
                      const salePrice = parseNumber(sale.price) || 0;
                      const psf = saleSize > 0 && salePrice > 0 ? salePrice / saleSize : 0;
                      const saleDate = sale.date || "N/A";

                      return (
                        <ComparableCard
                          key={`sale-${index}`}
                          title={sale.building || sale.name || "Property"}
                          details={`${analysis.bedrooms || "N/A"} • ${saleSize ? `${saleSize} sqft` : "N/A"} • ${analysis.area || "N/A"}`}
                          price={salePrice > 0 ? `AED ${salePrice.toLocaleString()}` : "N/A"}
                          psf={psf > 0 ? `AED ${psf.toLocaleString(undefined, { maximumFractionDigits: 0 })}/sq ft` : "N/A"}
                          status={`Sold ${saleDate}`}
                        />
                      );
                    })
                  )}
                </div>

                <button className="action-btn secondary" type="button">
                  View All Comparable Properties
                </button>
              </div>

              <div className="sidebar-card">
                <div className="card-title">
                  <div className="card-icon">⭐</div>
                  Investment Analysis
                </div>

                <div className="score-section">
                  {discountPercent !== null && (
                    <>
                      <div className="score-value">
                        {discountPercent.toFixed(1)}%<span> Below Market</span>
                      </div>
                      <div className="score-subtitle">
                        {discountPercent >= 15 ? "Excellent" : discountPercent >= 10 ? "Good" : "Fair"} Investment Opportunity
                      </div>
                      <p>
                        Based on price analysis, market trends, location score, rental
                        potential, and liquidity in {analysis.area || "the area"} market.
                      </p>
                      <div className="score-breakdown">
                        <p>
                          <strong>Listed Price:</strong> {listedPrice}
                        </p>
                        {estimateRange && (
                          <p>
                            <strong>Market Estimate:</strong> {estimateRange}
                          </p>
                        )}
                        {savingsMin && savingsMax && (
                          <p>
                            <strong>Potential Savings:</strong> AED {Math.round(savingsMin).toLocaleString()} - {Math.round(savingsMax).toLocaleString()}
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
                          <strong>{discountPercent.toFixed(1)}%</strong>
                        </li>
                        {rentalYield && (
                          <li>
                            <span>Rental Yield</span>
                            <strong>{rentalYield}</strong>
                          </li>
                        )}
                        <li>
                          <span>Building Status</span>
                          <strong>{buildingStatus === "READY" ? "Ready" : "Off-Plan"}</strong>
                        </li>
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
                      <div>{listedPrice}</div>
                      <span>Listed Price</span>
                    </div>
                    <div className="metric-box wide">
                      <div>{analysis.area || "N/A"}</div>
                      <span>Location</span>
                    </div>
                  </div>
                )}

                <p className="benefits-text">
                  <strong>Key Benefits:</strong> Property located in {analysis.area || "the area"}, {analysis.city || "the city"}. 
                  {buildingStatus === "READY" ? " Ready property allows immediate occupancy and rental income." : " Off-plan property offers potential for capital appreciation."}
                  {rentalYield && ` Rental yield of ${rentalYield} provides attractive returns for investors.`}
                </p>
              </div>
            </div>
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
                    ...areaOptions.map((area) => ({ value: area, label: area })),
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
}: {
  title: string;
  details: string;
  price: string | number;
  psf: string;
  status: string;
  sold?: boolean;
}) => (
  <div className="similar-property">
    <div className="similar-title">{title}</div>
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
