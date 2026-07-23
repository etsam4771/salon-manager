import { useState, type ChangeEvent, type FormEvent } from "react";
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail, HiOutlineClock } from "react-icons/hi";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import { CONFIG } from "../utils/constants";
import { apiEndpoints } from "../api/endpoint";

const info = [
  { icon: HiOutlineLocationMarker, label: "14 Willowmere Lane, Ranchi, Jharkhand" },
  { icon: HiOutlinePhone, label: "+91 98765 43210" },
  { icon: HiOutlineMail, label: "hello@elanova.spa" },
  { icon: HiOutlineClock, label: "Tue – Sun · 10am – 8pm" },
];
interface ContactForm {
  fullname : string;
  phone : string;
  email : string;
  message : string;
}

interface UIState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  url? : string;
}

export default function ContactPage() {
  const [formData , setFormData] = useState<ContactForm>({
    fullname : '',
    phone : '',
    email : '',
    message : '',
  })
  const [uiState, setUiState] = useState<UIState>({
    loading: false,
    error: null,
    successMessage: null,
  });
  console.log(uiState);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
        ...prev,
        [name]: value
    }))
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUiState({ loading: true, error: null, successMessage: null });
    // Client-side quick checks matching your backend ruleset constraints
    if (formData.fullname.length < 3) {
      setUiState({ loading: false, error: 'Full name must be at least 3 characters.', successMessage: null });
      return;
    }
    console.log(formData.phone);
    if (formData.phone.length !== 10 || isNaN(Number(formData.phone))) {
      setUiState({ loading: false, error: 'Phone number must be exactly 10 digits.', successMessage: null });
      return;
    }
    try {
      const response = await fetch(`${CONFIG.API_URL+apiEndpoints.home.contact.store}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Type cast the network response to match your backend ApiResponse/ApiError blueprint
      const result = await response.json() as { success: boolean; message: string };

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong processing your request.');
      }

      setUiState({
        loading: false,
        error: null,
        successMessage: result.message || 'Contact saved successfully!'
      });

      // Clear the form fields upon successful save
      setFormData({ fullname: '', email: '', phone: '', message: '' });

    } catch (err) {
      const errorInstance = err as Error;
      setUiState({
        loading: false,
        error: errorInstance.message,
        successMessage: null
      });
    }
  }

  return (
    <div>
      <section className="bg-sand-light pt-16 md:pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
            Get in touch
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-4">
            We'd like to hear from you
          </h1>
          <p className="mt-5 text-ink/70 text-lg leading-relaxed">
            Questions about a treatment, a group booking, or just want to
            check availability — send a note and we'll reply within a day.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2 flex flex-col gap-6">
            {info.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-forest shrink-0">
                  <Icon size={18} />
                </div>
                <p className="text-ink/70 pt-2 text-sm leading-relaxed">{label}</p>
              </div>
            ))}

            <div className="mt-4 h-48 rounded-tr-[36px] rounded-bl-[36px] overflow-hidden bg-sand">
              <svg viewBox="0 0 300 200" className="w-full h-full" aria-hidden="true">
                <rect width="300" height="200" fill="#F1E8DA" />
                <path d="M20 60C60 40 100 40 140 60C180 80 220 80 260 60" stroke="#33503F" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M20 100C60 80 100 80 140 100C180 120 220 120 260 100" stroke="#A9832F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
                <path d="M20 140C60 120 100 120 140 140C180 160 220 160 260 140" stroke="#33503F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
          </div>

          <div className="md:col-span-3">
            {( uiState.error != null) ? (
              <div className="bg-blush rounded-tr-[36px] rounded-bl-[36px] p-10 text-center">
                <h3 className="font-display text-2xl text-forest">Error</h3>
                <p className="mt-3 text-ink/60">
                  {uiState.error}
                </p>
              </div>
            ) : null}
            {(uiState.successMessage && uiState.error == null) ? (
              <div className="bg-sand rounded-tr-[36px] rounded-bl-[36px] p-10 text-center">
                <h3 className="font-display text-2xl text-forest">Message sent</h3>
                <p className="mt-3 text-ink/60">
                  Thank you — someone from our front desk will get back to you
                  within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="text-sm text-ink/70 font-body">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      required
                      type="text"
                      className="mt-2 w-full rounded-lg border border-blush bg-sand-light px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                      placeholder="Ananya Verma"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm text-ink/70 font-body">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      className="mt-2 w-full rounded-lg border border-blush bg-sand-light px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="text-sm text-ink/70 font-body">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}                  
                    required
                    type="email"
                    className="mt-2 w-full rounded-lg border border-blush bg-sand-light px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-sm text-ink/70 font-body">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="mt-2 w-full rounded-lg border border-blush bg-sand-light px-4 py-3 text-sm outline-none focus:border-forest transition-colors resize-none"
                    placeholder="Tell us what you're looking for…"
                  />
                </div>

                <Button type="submit" size="lg" className="self-start mt-2">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
