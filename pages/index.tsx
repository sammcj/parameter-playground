import Head from "next/head";

import Footer from "../components/commons/Footer";
import Header from "../components/commons/Header";
import ToneAdjuster from "../components/ToneAdjuster";
import { Toaster } from "../components/ui/sonner";
import MagicBackground from "../components/commons/MagicBackground/MagicBackground";

function Home() {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <title>LLM Parameter Playground</title>
        <meta
          name="description"
          content="Select two inference parameters to experiment with how they interact with each other and impact inference."
        />
        <meta
          name="keywords"
          content="ollama, llm, ai, language model, inference, tone changer, Parameter Playground, tone adjuster, inference parameters"
        />
        <meta name="author" content="sammcj" />
      </Head>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-1 font-sans">
        <div className="w-full z-10 max-w-8xl mx-auto p-2 lg:p-4">
          <Header />
          <ToneAdjuster />
          <Footer />
        </div>

        <Toaster />
        <MagicBackground />
      </div>
    </>
  );
}

export default Home;
