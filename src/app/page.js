"use client";

import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
    return (
        <div>
            <Hero />
            <section id="how-it-works" className='scroll-mt-16'>
                <HowItWorks />
            </section>

            <section id="features" className='scroll-mt-16'>
                <Features />
            </section>

            <section id="pricing" className='scroll-mt-16'>
                <Pricing />
            </section>

            <section id="testimonials" className='scroll-mt-16'>
                <Testimonials />
                <CTASection />
            </section>
        </div>
    );
}