"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      setFormState(initialFormState);
      setGoals([]);
      setPropertyTypes([]);
      setFieldErrors({});
    }, 1500);
  };

  return (
    <div className="early-access-page">
      <div className="circle circle1" />
      <div className="circle circle2" />
      <div className="circle circle3" />

      <div className="container">
        <header className="page-header">
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
          <form onSubmit={handleSubmit} noValidate>
            <section className="form-section">
              <h2 className="section-title">Contact Information</h2>
              <div className="form-grid">
                <div data-field="fullName">
                <FormInput
                  label="Full Name"
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
                  label="Email Address"
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
                  label="Phone Number"
                  type="tel"
                  value={formState.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                />
                </div>
                <div data-field="location">
                <FormInput
                  label="Current Location/Country"
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
              <h2 className="section-title">Investment Profile</h2>
              <div className="form-grid">
                <div data-field="experience">
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
                </div>
                <div data-field="timeline">
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
                    Primary Investment Goals
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
              <h2 className="section-title">Investment Preferences</h2>
              <div className={`form-group ${fieldErrors.targetRegions ? 'has-error' : ''}`} data-field="targetRegions">
                <label className="required-label">
                  Target Countries/Regions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Spain, Portugal, Dubai, Thailand"
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
                <label className="required-label">Property Types of Interest</label>
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
                disabled={isSubmitting}
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

