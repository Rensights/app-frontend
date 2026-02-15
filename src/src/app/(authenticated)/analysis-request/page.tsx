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

    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === "") return "N/A";
      return String(value);
    };

    const analysis = report?.analysisResult || {};
    const listedPrice = getAnalysisValue(["listed_price_aed", "listedPriceAed", "listed_price"]);
    const pricePerSqft = getAnalysisValue(["price_per_sqft", "pricePerSqft"]);
    const sizeSqft = getAnalysisValue(["size_sqft", "sizeSqft"]);
    const ourPriceEstimate = getAnalysisValue(["our_price_estimate", "ourPriceEstimate"]);
    const priceVsEstimations = getAnalysisValue(["price_vs_estimations", "priceVsEstimations"]);
    const potentialSavings = getAnalysisValue(["potential_savings", "potentialSavings"]);
    const pricePerSqftVsMarket = getAnalysisValue(["price_per_sqft_vs_market", "pricePerSqftVsMarket"]);
    const marketAvgPricePerSqft = getAnalysisValue(["market_average_price_per_sqft", "marketAveragePricePerSqft"]);
    const rensightsScore = getAnalysisValue(["rensights_score", "rensightsScore"]);
    const priceVsMarketScore = getAnalysisValue(["price_vs_market_score", "priceVsMarketScore"]);
    const rentalPotentialScore = getAnalysisValue(["rental_potential_score", "rentalPotentialScore"]);
    const liquidityScore = getAnalysisValue(["liquidity_score", "liquidityScore"]);
    const locationTransportScore = getAnalysisValue(["location_transport_score", "locationTransportScore"]);
    const grossRentalYield = getAnalysisValue(["gross_rental_yield", "grossRentalYield"]);
    const rentalYieldEstimate = getAnalysisValue(["rental_yield_estimate", "rentalYieldEstimate"]);
    const annualRentEstimate = getAnalysisValue(["annual_rent_estimate", "annualRentEstimate"]);
    const avgMarketYield = getAnalysisValue(["average_market_yield_estimate", "averageMarketYieldEstimate"]);
    const marketPosition = getAnalysisValue(["market_position", "marketPosition"]);
    const dubaiComparison = getAnalysisValue(["dubai_comparison", "dubaiComparison"]);
    const priceRange = getAnalysisValue(["price_range", "priceRange"]);
    const nearestLandmark = getAnalysisValue(["nearest_landmark", "nearestLandmark"]);
    const buildingFeatures = getAnalysisValue(["building_features", "buildingFeatures"]);
    const investmentAppeal = getAnalysisValue(["investment_appeal", "investmentAppeal"]);
    const propertyDescription = getAnalysisValue(["property_description", "propertyDescription"]);
    const listingComparables = parseJsonArray(getAnalysisValue(["listing_comparables", "listingComparables"]));
    const transactionComparables = parseJsonArray(getAnalysisValue(["transaction_comparables", "transactionComparables"]));

    return (
      <div className="property-page">
        <header className="header">
          <div className="header-left">
            <button className="back-btn" onClick={() => router.push("/dashboard")}>
              Back to Reports
            </button>
            <div>
              <div className="page-title">Property Analysis Report</div>
              <div className="page-subtitle">Your request status and results</div>
            </div>
          </div>
          <div className="verified-badge">{report?.status || "PENDING"}</div>
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
            <section className="property-overview">
              <div className="property-header">
                <div className="property-title">
                  {analysis.building_name || report.buildingName || "Property Analysis"}
                </div>
                <div className="property-location">
                  {analysis.area || report.area || "Dubai"} • {analysis.city || report.city || "Dubai"}
                </div>
                <div className="discount-highlight">
                  {report.status === "COMPLETED" ? "Analysis Complete" : "Analysis In Progress"}
                </div>
              </div>

              <div className="key-metrics">
                <div className="metric-card">
                  <div className="metric-value">{formatValue(listedPrice)}</div>
                  <div className="metric-label">Listed Price</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{formatValue(sizeSqft)}</div>
                  <div className="metric-label">Size (sq ft)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{formatValue(analysis.bedrooms || report.bedrooms)}</div>
                  <div className="metric-label">Bedrooms</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{formatValue(analysis.property_type || report.propertyType)}</div>
                  <div className="metric-label">Property Type</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{formatValue(pricePerSqft)}</div>
                  <div className="metric-label">Price / Sq Ft</div>
                </div>
              </div>

              <div className="price-analysis">
                <h3>Price Analysis</h3>
                <div className="price-grid">
                  <div>
                    <div className="price-label">Our Price Estimate</div>
                    <div className="price-value price-estimate">{formatValue(ourPriceEstimate)}</div>
                  </div>
                  <div>
                    <div className="price-label">Price vs Estimations</div>
                    <div className="price-value">{formatValue(priceVsEstimations)}</div>
                  </div>
                  <div>
                    <div className="price-label">Potential Savings</div>
                    <div className="price-value">{formatValue(potentialSavings)}</div>
                  </div>
                  <div>
                    <div className="price-label">Price / Sq Ft vs Market</div>
                    <div className="price-value">{formatValue(pricePerSqftVsMarket)}</div>
                  </div>
                  <div>
                    <div className="price-label">Market Avg / Sq Ft</div>
                    <div className="price-value">{formatValue(marketAvgPricePerSqft)}</div>
                  </div>
                </div>
              </div>

              <div className="property-description">
                <h3>Summary</h3>
                <p>{propertyDescription || "No summary provided yet."}</p>
              </div>
            </section>

            <aside className="sidebar-card">
              <div className="comparison-table">
                <h3>Scores</h3>
                <div className="detail-row">
                  <span>Rensights Score</span>
                  <strong>{formatValue(rensightsScore)}</strong>
                </div>
                <div className="detail-row">
                  <span>Price vs Market</span>
                  <strong>{formatValue(priceVsMarketScore)}</strong>
                </div>
                <div className="detail-row">
                  <span>Rental Potential</span>
                  <strong>{formatValue(rentalPotentialScore)}</strong>
                </div>
                <div className="detail-row">
                  <span>Liquidity</span>
                  <strong>{formatValue(liquidityScore)}</strong>
                </div>
                <div className="detail-row">
                  <span>Location & Transport</span>
                  <strong>{formatValue(locationTransportScore)}</strong>
                </div>
              </div>

              <div className="comparison-table">
                <h3>Rental & Market</h3>
                <div className="detail-row">
                  <span>Gross Rental Yield</span>
                  <strong>{formatValue(grossRentalYield)}</strong>
                </div>
                <div className="detail-row">
                  <span>Rental Yield Estimate</span>
                  <strong>{formatValue(rentalYieldEstimate)}</strong>
                </div>
                <div className="detail-row">
                  <span>Annual Rent Estimate</span>
                  <strong>{formatValue(annualRentEstimate)}</strong>
                </div>
                <div className="detail-row">
                  <span>Average Market Yield</span>
                  <strong>{formatValue(avgMarketYield)}</strong>
                </div>
                <div className="detail-row">
                  <span>Market Position</span>
                  <strong>{formatValue(marketPosition)}</strong>
                </div>
                <div className="detail-row">
                  <span>Dubai Comparison</span>
                  <strong>{formatValue(dubaiComparison)}</strong>
                </div>
                <div className="detail-row">
                  <span>Price Range</span>
                  <strong>{formatValue(priceRange)}</strong>
                </div>
                <div className="detail-row">
                  <span>Nearest Landmark</span>
                  <strong>{formatValue(nearestLandmark)}</strong>
                </div>
              </div>

              <div className="comparison-table">
                <h3>Property Details</h3>
                <div className="detail-row">
                  <span>Building Status</span>
                  <strong>{formatValue(analysis.building_status || report.buildingStatus)}</strong>
                </div>
                <div className="detail-row">
                  <span>Furnishing</span>
                  <strong>{formatValue(analysis.furnishing || report.furnishing)}</strong>
                </div>
                <div className="detail-row">
                  <span>Developer</span>
                  <strong>{formatValue(analysis.developer || report.developer)}</strong>
                </div>
                <div className="detail-row">
                  <span>View</span>
                  <strong>{formatValue(analysis.view || report.view)}</strong>
                </div>
                <div className="detail-row">
                  <span>Service Charge</span>
                  <strong>{formatValue(analysis.service_charge || report.serviceCharge)}</strong>
                </div>
                <div className="detail-row">
                  <span>Building Features</span>
                  <strong>{formatValue(buildingFeatures)}</strong>
                </div>
                <div className="detail-row">
                  <span>Investment Appeal</span>
                  <strong>{formatValue(investmentAppeal)}</strong>
                </div>
              </div>

              <div className="comparison-table">
                <h3>Listing Comparables</h3>
                {listingComparables.length === 0 ? (
                  <p className="empty-state">No comparables available.</p>
                ) : (
                  <div className="comparables-grid">
                    {listingComparables.map((item: any, index: number) => (
                      <div key={`listing-${index}`} className="comparable-card">
                        <div className="comparable-title">{formatValue(item.building || item.name)}</div>
                        <div className="comparable-meta">
                          <span>{formatValue(item.price)}</span>
                          <span>{formatValue(item.sqft)} sq ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="comparison-table">
                <h3>Transaction Comparables</h3>
                {transactionComparables.length === 0 ? (
                  <p className="empty-state">No transactions available.</p>
                ) : (
                  <div className="comparables-grid">
                    {transactionComparables.map((item: any, index: number) => (
                      <div key={`transaction-${index}`} className="comparable-card">
                        <div className="comparable-title">{formatValue(item.building || item.name)}</div>
                        <div className="comparable-meta">
                          <span>{formatValue(item.price)}</span>
                          <span>{formatValue(item.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="investment-insights">
                <h3>Raw Analysis Result</h3>
                {report.analysisResult ? (
                  <pre className="analysis-result-json">
                    {JSON.stringify(report.analysisResult, null, 2)}
                  </pre>
                ) : (
                  <p>Your analysis is still processing. Results will appear here once approved.</p>
                )}
              </div>
            </aside>
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
