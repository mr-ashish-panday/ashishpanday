import { startTransition, useEffect, useState } from "react";
import ReactLenis from "lenis/react";
import { useProgress } from "@react-three/drei";
import { projects, servicesData, socials } from "./constants";
import { fetchHealth, fetchPortfolio } from "./lib/api";
import About from "./sections/About";
import Contact from "./sections/Contact";
import ContactSummary from "./sections/ContactSummary";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import Services from "./sections/Services";
import ServiceSummary from "./sections/ServiceSummary";
import Works from "./sections/Works";

const fallbackPortfolio = {
  profile: {
    name: "Ashish Panday",
    role: "AI researcher, builder, and systems-minded developer",
    email: "ashishpanday9818@gmail.com",
    location: "Kathmandu, Nepal",
  },
  services: servicesData,
  projects,
};

const App = () => {
  const { progress, active } = useProgress();
  const [isReady, setIsReady] = useState(false);
  const [portfolio, setPortfolio] = useState(fallbackPortfolio);
  const [backendStatus, setBackendStatus] = useState({
    status: "checking",
    submissions: 0,
    checkedAt: null,
    storageMode: "unknown",
    emailMode: "unknown",
  });

  useEffect(() => {
    if (progress === 100) {
      setIsReady(true);
    }
  }, [progress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active && progress === 0) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  useEffect(() => {
    let ignore = false;

    const loadPortfolio = async () => {
      try {
        const [portfolioResponse, healthResponse] = await Promise.all([
          fetchPortfolio(),
          fetchHealth(),
        ]);

        if (ignore) {
          return;
        }

        startTransition(() => {
          setPortfolio((current) => ({
            ...current,
            ...portfolioResponse,
          }));
          setBackendStatus({
            status: "online",
            submissions: healthResponse.submissions || 0,
            checkedAt: healthResponse.checkedAt || null,
            storageMode: healthResponse.storageMode || "unknown",
            emailMode: healthResponse.emailMode || "unknown",
          });
        });
      } catch {
        if (!ignore) {
          setBackendStatus({
            status: "offline",
            submissions: 0,
            checkedAt: null,
            storageMode: "unknown",
            emailMode: "unknown",
          });
        }
      }
    };

    loadPortfolio();

    return () => {
      ignore = true;
    };
  }, []);

  const handleMessageSaved = () => {
    setBackendStatus((current) => ({
      ...current,
      status: "online",
      submissions: current.submissions + 1,
      checkedAt: new Date().toISOString(),
      storageMode:
        current.storageMode === "unknown" ? "local-file" : current.storageMode,
      emailMode: current.emailMode === "unknown" ? "disabled-local" : current.emailMode,
    }));
  };

  return (
    <ReactLenis root className="relative w-screen min-h-screen overflow-x-hidden">
      {!isReady && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700 font-light">
          <p className="mb-4 text-xl tracking-widest animate-pulse">
            Loading {Math.floor(progress)}%
          </p>
          <div className="relative h-1 overflow-hidden rounded w-60 bg-white/20">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-300 bg-white"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div
        className={`${
          isReady ? "opacity-100" : "opacity-0"
        } transition-opacity duration-1000`}
      >
        <Navbar />
        <Hero />
        <ServiceSummary />
        <Services services={portfolio.services} />
        <About />
        <Works projects={portfolio.projects} />
        <ContactSummary />
        <Contact
          profile={portfolio.profile}
          socials={socials}
          backendStatus={backendStatus}
          onMessageSaved={handleMessageSaved}
        />
      </div>
    </ReactLenis>
  );
};

export default App;
