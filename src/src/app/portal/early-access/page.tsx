"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./early-access.css";
import { useTranslations } from "@/hooks/useTranslations";
import { apiClient } from "@/lib/api";

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
  const router = useRouter();
  const { t } = useTranslations("earlyAccess", {
    "earlyAccess.title": "Get Early Access to Premium Package \"Trusted Advisor\"",
    "earlyAccess.subtitle": "We will support you in identifying attractive investment opportunities, coordinating with owners and agents so you don't have to, helping in determining and negotiating offers, and guiding you through every step of your international real estate investment journey. Request access now and be a pioneer!",
    "earlyAccess.section.contact": "Contact Information",
    "earlyAccess.section.investment": "Investment Profile",
    "earlyAccess.section.preferences": "Investment Preferences",
    "earlyAccess.section.additional": "Additional Details",
    "earlyAccess.submit": "Submit Request",
    "earlyAccess.submitting": "Submitting...",
    "earlyAccess.successTitle": "Thanks for your interest!",
    "earlyAccess.successBody": "Your early access request has been received. We'll reach out soon.",
    "earlyAccess.backHome": "Back to Home",
    "earlyAccess.fullName": "Full Name",
    "earlyAccess.email": "Email Address",
    "earlyAccess.phone": "Phone Number",
    "earlyAccess.location": "Current Location/Country",
    "earlyAccess.experience": "Investment Experience Level",
    "earlyAccess.budget": "Investment Budget Range",
    "earlyAccess.portfolio": "Current Portfolio Size",
    "earlyAccess.timeline": "Investment Timeline",
    "earlyAccess.goals": "Primary Investment Goals",
    "earlyAccess.propertyTypes": "Property Types of Interest",
    "earlyAccess.targetRegions": "Target Countries/Regions",
    "earlyAccess.targetRegionsPlaceholder": "e.g., Spain, Portugal, Dubai, Thailand",
    "earlyAccess.challenges": "Biggest Investment Challenges",
    "earlyAccess.challengesPlaceholder": "Tell us about any challenges you've faced or concerns you have...",
    "earlyAccess.valuableServices": "Most Valuable Services",
    "earlyAccess.valuableServicesPlaceholder": "What features or services would be most valuable to you?",
  });
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [goals, setGoals] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-redirect to landing page after 3 seconds when success modal is shown
  useEffect(() => {
    if (showSuccessModal) {
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [showSuccessModal, router]);

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
    const errors: Record<string, string> = {};

    // Contact Information
    if (!formState.fullName?.trim()) {
      errors.fullName = "Full Name is required";
    }
    if (!formState.email?.trim()) {
      errors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formState.location?.trim()) {
      errors.location = "Current Location/Country is required";
    }

    // Investment Profile
    if (!formState.experience) {
      errors.experience = "Investment Experience Level is required";
    }
    if (!formState.budget) {
      errors.budget = "Investment Budget Range is required";
    }
    if (!formState.timeline) {
      errors.timeline = "Investment Timeline is required";
    }
    if (goals.length === 0) {
      errors.goals = "Please select at least one Primary Investment Goal";
    }
    if (propertyTypes.length === 0) {
      errors.propertyTypes = "Please select at least one Property Type of Interest";
    }

    // Investment Preferences
    if (!formState.targetRegions?.trim()) {
      errors.targetRegions = "Target Countries/Regions is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to first error field after state updates
      const firstErrorField = Object.keys(errors)[0];
      
      // Function to scroll to error field
      const scrollToErrorField = () => {
        const fieldContainer = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
        if (!fieldContainer) {
          console.log('Field container not found:', firstErrorField);
          return false;
        }
        
        // Look for input, select, or checkbox-group within the container
        const inputElement = fieldContainer.querySelector('input:not([type="checkbox"]), select, textarea') as HTMLElement;
        const checkboxGroup = fieldContainer.querySelector('.checkbox-group') as HTMLElement;
        const elementToScroll = inputElement || checkboxGroup || fieldContainer;
        
        if (!elementToScroll) {
          console.log('Element to scroll not found');
          return false;
        }
        
        // Get header
        const header = document.querySelector('header') as HTMLElement;
        
        // Measure actual header height
        const headerRect = header?.getBoundingClientRect();
        const headerHeight = headerRect ? headerRect.height : 20;
        
        // Calculate total offset needed - header + padding
        const totalOffset = headerHeight + 40;
        
        // Get element position BEFORE scrolling
        const elementRect = elementToScroll.getBoundingClientRect();
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const elementTop = elementRect.top + currentScroll;
        
        // Calculate target scroll position
        const targetScroll = elementTop - totalOffset;
        
        // Scroll directly to the calculated position (no smooth for immediate effect, then smooth)
        // First do instant scroll to get close
        window.scrollTo({
          top: Math.max(0, targetScroll - 100), // Scroll a bit higher first
          behavior: 'auto'
        });
        
        // Then smooth scroll to exact position
        setTimeout(() => {
          const newElementRect = elementToScroll.getBoundingClientRect();
          const newScroll = window.pageYOffset || document.documentElement.scrollTop;
          const newElementTop = newElementRect.top + newScroll;
          const finalTargetScroll = newElementTop - totalOffset;
          
          window.scrollTo({
            top: Math.max(0, finalTargetScroll),
            behavior: 'smooth'
          });
          
          // Final verification after smooth scroll
          setTimeout(() => {
            const finalRect = elementToScroll.getBoundingClientRect();
            const finalHeaderRect = header?.getBoundingClientRect();
            const headerBottom = finalHeaderRect ? finalHeaderRect.bottom : 0;
            
            // If still under header, force one more time
            if (finalRect.top <= headerBottom + 20) {
              const forceScroll = (finalRect.top + (window.pageYOffset || document.documentElement.scrollTop)) - totalOffset;
              window.scrollTo({
                top: Math.max(0, forceScroll),
                behavior: 'smooth'
              });
            }
          }, 1000);
        }, 50);
        
        // Focus input after scroll
        if (inputElement && (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT')) {
          setTimeout(() => {
            (inputElement as HTMLElement).focus();
            inputElement.style.transition = 'box-shadow 0.3s';
            inputElement.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.3)';
            setTimeout(() => {
              inputElement.style.boxShadow = '';
            }, 2000);
          }, 1000);
        }
        
        return true;
      };
      
      // Try scrolling with increasing delays to ensure DOM is ready
      setTimeout(() => {
        if (!scrollToErrorField()) {
          setTimeout(() => {
            if (!scrollToErrorField()) {
              setTimeout(scrollToErrorField, 200);
            }
          }, 200);
        }
      }, 400);
      
      return false;
    }

    return true;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const isValid = validateForm();
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);
    apiClient.submitEarlyAccessRequest({
      fullName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      location: formState.location,
      experience: formState.experience,
      budget: formState.budget,
      portfolio: formState.portfolio,
      timeline: formState.timeline,
      goals,
      propertyTypes,
      targetRegions: formState.targetRegions,
      challenges: formState.challenges,
      valuableServices: formState.valuableServices,
    })
      .then(() => {
        setIsSubmitting(false);
        setShowSuccessModal(true);
        setFormState(initialFormState);
        setGoals([]);
        setPropertyTypes([]);
        setFieldErrors({});
      })
      .catch((err: any) => {
        setIsSubmitting(false);
        setFieldErrors({});
        alert(err?.message || "Failed to submit early access request.");
      });
  };

  return (
    <div className="early-access-page">
      <div className="circle circle1" />
      <div className="circle circle2" />
      <div className="circle circle3" />

      <div className="container">
        <header className="page-header">
          <h1>{t("earlyAccess.title")}</h1>
          <p>
            {t("earlyAccess.subtitle")}
          </p>
        </header>

        <div className="form-container">
          <form onSubmit={handleSubmit} noValidate>
            <section className="form-section">
              <h2 className="section-title">{t("earlyAccess.section.contact")}</h2>
              <div className="form-grid">
                <div data-field="fullName">
                <FormInput
                  label={t("earlyAccess.fullName")}
                  required
                  value={formState.fullName}
                    onChange={(value) => {
                      handleInputChange("fullName", value);
                      if (fieldErrors.fullName) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.fullName;
                          return next;
                        });
                      }
                    }}
                    error={fieldErrors.fullName}
                  />
                </div>
                <div data-field="email">
                <FormInput
                  label={t("earlyAccess.email")}
                  type="email"
                  required
                  value={formState.email}
                    onChange={(value) => {
                      handleInputChange("email", value);
                      if (fieldErrors.email) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.email;
                          return next;
                        });
                      }
                    }}
                    error={fieldErrors.email}
                  />
                </div>
                <div data-field="phone">
                <FormInput
                  label={t("earlyAccess.phone")}
                  type="tel"
                  value={formState.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                />
                </div>
                <div data-field="location">
                <FormInput
                  label={t("earlyAccess.location")}
                  required
                  value={formState.location}
                    onChange={(value) => {
                      handleInputChange("location", value);
                      if (fieldErrors.location) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.location;
                          return next;
                        });
                      }
                    }}
                    error={fieldErrors.location}
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="section-title">{t("earlyAccess.section.investment")}</h2>
              <div className="form-grid">
                <div data-field="experience">
                <FormSelect
                  label={t("earlyAccess.experience")}
                  required
                  value={formState.experience}
                  options={[
                    "",
                    "Beginner",
                    "Intermediate",
                    "Experienced",
                  ]}
                    onChange={(value) => {
                      handleInputChange("experience", value);
                      if (fieldErrors.experience) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.experience;
                          return next;
                        });
                      }
                    }}
                    error={fieldErrors.experience}
                  />
                </div>
                <div data-field="budget">
                <FormSelect
                  label={t("earlyAccess.budget")}
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
                    onChange={(value) => {
                      handleInputChange("budget", value);
                      if (fieldErrors.budget) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.budget;
                          return next;
                        });
                      }
                    }}
                    error={fieldErrors.budget}
                  />
                </div>
                <div data-field="portfolio">
                <FormSelect
                  label={t("earlyAccess.portfolio")}
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
                </div>
                <div data-field="timeline">
                <FormSelect
                  label={t("earlyAccess.timeline")}
                  required
                  value={formState.timeline}
                  options={[
                    "",
                    "Immediately",
                    "3-6 months",
                    "6-12 months",
                    "Just exploring",
                  ]}
                    onChange={(value) => {
                      handleInputChange("timeline", value);
                      if (fieldErrors.timeline) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.timeline;
                          return next;
                        });
                      }
                    }}
                    error={fieldErrors.timeline}
                  />
                </div>
                <div className={`form-group full-width ${fieldErrors.goals ? 'has-error' : ''}`} data-field="goals">
                  <label className="required-label">
                    {t("earlyAccess.goals")}
                  </label>
                  <div className={`checkbox-group ${fieldErrors.goals ? 'has-error' : ''}`}>
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className={`checkbox-item ${
                          goals.includes(goal) ? "checked" : ""
                        }`}
                        onClick={() => {
                          toggleSelection(goal, goals, setGoals);
                          if (fieldErrors.goals && goals.length === 0) {
                            setFieldErrors(prev => {
                              const next = { ...prev };
                              delete next.goals;
                              return next;
                            });
                          }
                        }}
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
                  {fieldErrors.goals && (
                    <div style={{ 
                      color: '#dc2626', 
                      fontSize: '0.75rem', 
                      marginTop: '0.5rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>⚠</span>
                      <span>{fieldErrors.goals}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="section-title">{t("earlyAccess.section.preferences")}</h2>
              <div className={`form-group ${fieldErrors.targetRegions ? 'has-error' : ''}`} data-field="targetRegions">
                <label className="required-label">
                  {t("earlyAccess.targetRegions")}
                </label>
                <input
                  type="text"
                  placeholder={t("earlyAccess.targetRegionsPlaceholder") || "e.g., Spain, Portugal, Dubai, Thailand"}
                  value={formState.targetRegions}
                  onChange={(event) => {
                    handleInputChange("targetRegions", event.target.value);
                    if (fieldErrors.targetRegions) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.targetRegions;
                        return next;
                      });
                    }
                  }}
                  className={fieldErrors.targetRegions ? 'error' : ''}
                />
                {fieldErrors.targetRegions && (
                  <div style={{ 
                    color: '#dc2626', 
                    fontSize: '0.75rem', 
                    marginTop: '0.5rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠</span>
                    <span>{fieldErrors.targetRegions}</span>
                  </div>
                )}
              </div>
              <div className={`form-group ${fieldErrors.propertyTypes ? 'has-error' : ''}`} data-field="propertyTypes">
                <label className="required-label">{t("earlyAccess.propertyTypes")}</label>
                <div className={`checkbox-group ${fieldErrors.propertyTypes ? 'has-error' : ''}`}>
                  {propertyTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`checkbox-item ${
                        propertyTypes.includes(type) ? "checked" : ""
                      }`}
                      onClick={() => {
                        toggleSelection(type, propertyTypes, setPropertyTypes);
                        if (fieldErrors.propertyTypes && propertyTypes.length === 0) {
                          setFieldErrors(prev => {
                            const next = { ...prev };
                            delete next.propertyTypes;
                            return next;
                          });
                        }
                      }}
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
                {fieldErrors.propertyTypes && (
                  <div style={{ 
                    color: '#dc2626', 
                    fontSize: '0.75rem', 
                    marginTop: '0.5rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠</span>
                    <span>{fieldErrors.propertyTypes}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="form-section">
              <h2 className="section-title">{t("earlyAccess.section.additional")}</h2>
              <div className="form-group">
                <label>{t("earlyAccess.challenges")}</label>
                <textarea
                  placeholder={t("earlyAccess.challengesPlaceholder") || "Tell us about any challenges you've faced or concerns you have..."}
                  value={formState.challenges}
                  onChange={(event) =>
                    handleInputChange("challenges", event.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>{t("earlyAccess.valuableServices")}</label>
                <textarea
                  placeholder={t("earlyAccess.valuableServicesPlaceholder") || "What features or services would be most valuable to you?"}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? t("earlyAccess.submitting") : t("earlyAccess.submit")}
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
            <h2>{t("earlyAccess.successTitle")}</h2>
            <p>
              {t("earlyAccess.successBody")}
            </p>
            <button type="button" onClick={() => setShowSuccessModal(false)}>
              {t("earlyAccess.backHome")}
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
  error?: string;
};

const FormInput = ({
  label,
  required,
  type = "text",
  value,
  onChange,
  error,
}: InputProps) => {
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "tel") {
      // Only allow numbers, +, -, spaces, and parentheses for phone numbers
      const phoneValue = event.target.value.replace(/[^\d+\-() ]/g, '');
      onChange(phoneValue);
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
    <label className={required ? "required-label" : undefined}>{label}</label>
    <input
      type={type}
      value={value}
        onChange={handlePhoneChange}
        pattern={type === "tel" ? "[0-9+\-() ]*" : undefined}
        className={error ? 'error' : ''}
      />
      {error && (
        <div style={{ 
          color: '#dc2626', 
          fontSize: '0.75rem', 
          marginTop: '0.5rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
  </div>
);
};

const FormSelect = ({
  label,
  required,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
}) => (
  <div className={`form-group ${error ? 'has-error' : ''}`}>
    <label className={required ? "required-label" : undefined}>{label}</label>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={error ? 'error' : ''}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option || "Select an option"}
        </option>
      ))}
    </select>
    {error && (
      <div style={{ 
        color: '#dc2626', 
        fontSize: '0.75rem', 
        marginTop: '0.5rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>⚠</span>
        <span>{error}</span>
      </div>
    )}
  </div>
);
