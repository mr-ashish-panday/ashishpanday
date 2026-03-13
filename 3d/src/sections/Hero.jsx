import { Canvas } from "@react-three/fiber";
import { Planet } from "../components/Planet";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const text = `I research AI, build autonomous systems,
and ship infrastructure that works
while you sleep`;

  useGSAP(() => {
    gsap.from(".stat-item", {
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      delay: 1.5,
      ease: "power3.out",
    });
  }, []);

  return (
    <section id="home" className="flex flex-col justify-end min-h-screen">
      <AnimatedHeaderSection
        subTitle={"ML Researcher & Builder — Nepal"}
        title={"Ashish\u00A0Panday"}
        text={text}
        textColor={"text-black"}
      />

      {/* Stats bar */}
      <div className="flex flex-wrap justify-start gap-8 md:gap-16 px-1 sm:px-1 md:px-3 lg:px-6 pb-10 ultra-small-screen">
        <div className="stat-item">
          <p className="text-3xl md:text-5xl font-normal tracking-tight text-black">10</p>
          <p className="text-xs md:text-sm uppercase tracking-widest text-black/40 mt-1">Research Papers</p>
        </div>
        <div className="stat-item">
          <p className="text-3xl md:text-5xl font-normal tracking-tight text-black">120M+</p>
          <p className="text-xs md:text-sm uppercase tracking-widest text-black/40 mt-1">Views Generated</p>
        </div>
        <div className="stat-item">
          <p className="text-3xl md:text-5xl font-normal tracking-tight text-black">100K+</p>
          <p className="text-xs md:text-sm uppercase tracking-widest text-black/40 mt-1">Followers Built</p>
        </div>
        <div className="stat-item">
          <p className="text-3xl md:text-5xl font-normal tracking-tight text-black">12.82B+</p>
          <p className="text-xs md:text-sm uppercase tracking-widest text-black/40 mt-1">Client Views</p>
        </div>
      </div>

      <figure
        className="absolute inset-0 -z-50"
        style={{ width: "100%", height: "100vh" }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, -10], fov: 17.5, near: 1, far: 20 }}
        >
          <ambientLight intensity={0.5} />
          <Float speed={0.5}>
            <Planet scale={isMobile ? 0.7 : 1} />
          </Float>
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 4, 1]}>
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[0, 5, -9]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[0, 3, 1]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[-5, -1, -1]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[10, 1, 0]}
                scale={16}
              />
            </group>
          </Environment>
        </Canvas>
      </figure>
    </section>
  );
};

export default Hero;
