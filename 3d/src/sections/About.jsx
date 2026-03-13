import { useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Icon } from "@iconify/react/dist/iconify.js";

const About = () => {
  const text = `10 research papers. 3 published, 2 under review.
    One at a Q1 journal, one at an A* conference.
    Building what changes context windows`;
  const aboutText = `21 years old from Nepal. Helped Blastly (Canada) build internal systems. Built most of Essence Software Development (Ireland)'s GTM system — finding and qualifying CEOs at natural health companies doing $1M–$10M in revenue, enriching through Clay, and building the outreach pipeline via agentic workflows. Interned at Prateek Innovation for Nepali Sign Language recognition research.

A small piece of my work ended up in one of the largest business series launches of 2025 on YouTube. Strong NDA. On the backend, helped creators generate massive reach — Carlos (5B+, YT Shorts), Logan (7B+, TikTok). Also helped people working with Iman Gadzhi, Jacqueline Vagar, and BBC Africa. Built up 100K+ followers and 120M+ views combined.
  When I'm not researching:`;
  const imgRef = useRef(null);
  useGSAP(() => {
    gsap.to("#about", {
      scale: 0.95,
      scrollTrigger: {
        trigger: "#about",
        start: "bottom 80%",
        end: "bottom 20%",
        scrub: true,
        markers: false,
      },
      ease: "power1.inOut",
    });

    gsap.set(imgRef.current, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
    });
    gsap.to(imgRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 2,
      ease: "power4.out",
      scrollTrigger: { trigger: imgRef.current },
    });
  });
  return (
    <section id="about" className="min-h-screen bg-black rounded-b-4xl">
      <AnimatedHeaderSection
        subTitle={"Research meets execution, always shipping"}
        title={"About"}
        text={text}
        textColor={"text-white"}
        withScrollTrigger={true}
      />
      <div className="flex flex-col items-center justify-between gap-16 px-1 sm:px-1 md:px-3 lg:px-6 pb-16 text-xl font-light tracking-wide lg:flex-row md:text-2xl lg:text-3xl text-white/60 ultra-small-screen">
        <img
          ref={imgRef}
          src={`${import.meta.env.BASE_URL}images/pfp.png`}
          alt="Ashish Panday"
          className="w-md rounded-3xl"
        />
        <div className="w-full">
          <AnimatedTextLines text={aboutText} className={"w-full"} />
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:brain" className="text-white/80" />
              <span>Training models on the latest arXiv papers</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:code" className="text-white/80" />
              <span>Open-sourcing experiments — rising tides lift all ships</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:mountain" className="text-white/80" />
              <span>Exploring the Himalayas</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:gamepad-2" className="text-white/80" />
              <span>Gaming</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
