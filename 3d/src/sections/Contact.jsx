import { useState } from "react";
import { useGSAP } from "@gsap/react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import Marquee from "../components/Marquee";
import gsap from "gsap";
import { socials as fallbackSocials } from "../constants";
import { submitContactMessage } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const Contact = ({
  profile = {
    email: "ashishpanday9818@gmail.com",
    location: "Kathmandu, Nepal",
  },
  socials = fallbackSocials,
  backendStatus = {
    status: "checking",
    submissions: 0,
    storageMode: "unknown",
    emailMode: "unknown",
  },
  onMessageSaved,
}) => {
  const text = `Got a research question, project idea,
    or want to build something together?
    Let's talk.`;
  const items = [
    "Say Hello",
    "Start A Project",
    "Research Collab",
    "Let's Chat",
    "Get In Touch",
  ];
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
  });

  useGSAP(() => {
    gsap.from(".social-link", {
      y: 100,
      opacity: 0,
      delay: 0.5,
      duration: 1,
      stagger: 0.3,
      ease: "back.out",
      scrollTrigger: {
        trigger: ".social-link",
      },
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({
      status: "submitting",
      message: "Sending your message...",
    });

    try {
      const response = await submitContactMessage(form);
      const referenceId = response.submission.id.slice(0, 8).toUpperCase();

      setSubmitState({
        status: "success",
        message: `${response.message} Ref: ${referenceId}`,
      });
      setFieldErrors({});
      setForm(initialForm);
      onMessageSaved?.(response.submission);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error.message || "Unable to send your message right now.",
      });
      setFieldErrors(error.details || {});
    }
  };

  const backendLabel =
    backendStatus.status === "online" &&
    backendStatus.storageMode === "vercel-blob" &&
    backendStatus.emailMode === "resend"
      ? `Backend online - email alerts active, ${backendStatus.submissions} message${
          backendStatus.submissions === 1 ? "" : "s"
        } stored`
      : backendStatus.status === "online" &&
        backendStatus.emailMode === "missing-resend"
      ? "Backend online - connect Resend before using the deployed contact form"
      : backendStatus.status === "online" &&
        backendStatus.storageMode === "missing-vercel-blob"
      ? "Backend online - connect Vercel Blob before using the deployed contact form"
      : backendStatus.status === "online"
      ? `Backend online - local storage active, ${backendStatus.submissions} message${
          backendStatus.submissions === 1 ? "" : "s"
        } stored, email alerts ${
          backendStatus.emailMode === "resend" ? "enabled" : "disabled"
        }`
      : backendStatus.status === "checking"
      ? "Checking backend connection..."
      : "Backend offline - running in frontend-only mode";

  return (
    <section
      id="contact"
      className="flex flex-col justify-between min-h-screen bg-black"
    >
      <div>
        <AnimatedHeaderSection
          subTitle={"You Dream It, I Build It"}
          title={"Contact"}
          text={text}
          textColor={"text-white"}
          withScrollTrigger={true}
        />
        <div className="grid gap-12 px-1 sm:px-1 md:px-3 lg:px-6 pb-10 text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ultra-small-screen">
          <div className="flex flex-col gap-10 font-light uppercase lg:text-[32px] text-[26px] leading-none">
            <div className="social-link">
              <h2>E-mail</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <p className="text-xl tracking-wider lowercase md:text-2xl lg:text-3xl">
                {profile.email}
              </p>
            </div>
            <div className="social-link">
              <h2>Location</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <p className="text-xl lowercase md:text-2xl lg:text-3xl">
                {profile.location}
              </p>
            </div>
            <div className="social-link">
              <h2>Social Media</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <div className="flex flex-wrap gap-2">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs leading-loose tracking-wides uppercase md:text-sm hover:text-white/80 transition-colors duration-200"
                  >
                    {"{ "}
                    {social.name}
                    {" }"}
                  </a>
                ))}
              </div>
            </div>
            <div className="social-link">
              <h2>Server</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <p className="text-base tracking-wide normal-case md:text-lg lg:text-xl text-white/80">
                {backendLabel}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="social-link rounded-3xl border border-white/20 bg-white/5 p-5 md:p-7"
          >
            <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-white/15">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                  Contact Form
                </p>
                <h3 className="mt-2 text-3xl font-light md:text-4xl normal-case">
                  Send a real message
                </h3>
              </div>
              <div className="px-3 py-2 text-xs uppercase border rounded-full border-white/20 text-white/70 tracking-[0.25em]">
                API
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Name
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-base outline-none transition-colors focus:border-white/50 normal-case"
                  placeholder="Your name"
                />
                {fieldErrors.name && (
                  <span className="text-sm text-red-300 normal-case">
                    {fieldErrors.name}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-base lowercase outline-none transition-colors focus:border-white/50"
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <span className="text-sm text-red-300 normal-case">
                    {fieldErrors.email}
                  </span>
                )}
              </label>
            </div>

            <label className="flex flex-col gap-2 mt-4">
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                Subject
              </span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-base outline-none transition-colors focus:border-white/50 normal-case"
                placeholder="Project idea"
              />
              {fieldErrors.subject && (
                <span className="text-sm text-red-300 normal-case">
                  {fieldErrors.subject}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 mt-4">
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                Message
              </span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                className="rounded-3xl border border-white/15 bg-black/30 px-4 py-3 text-base outline-none transition-colors focus:border-white/50 resize-none normal-case"
                placeholder="Tell me what you want to build..."
              />
              {fieldErrors.message && (
                <span className="text-sm text-red-300 normal-case">
                  {fieldErrors.message}
                </span>
              )}
            </label>

            <div className="flex flex-col gap-4 mt-6 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                disabled={submitState.status === "submitting"}
                className="rounded-full border border-white/20 px-6 py-3 text-sm uppercase tracking-[0.35em] transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState.status === "submitting" ? "Sending" : "Submit"}
              </button>

              <p
                className={`text-sm normal-case ${
                  submitState.status === "error"
                    ? "text-red-300"
                    : submitState.status === "success"
                    ? "text-emerald-300"
                    : "text-white/60"
                }`}
              >
                {submitState.message || "Messages are saved by the backend API."}
              </p>
            </div>
          </form>
        </div>
      </div>
      <Marquee items={items} className="text-white bg-transparent" />
    </section>
  );
};

export default Contact;
