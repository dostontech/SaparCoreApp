import CallToActionSection from '@/sections/call-to-action-section';
import CostComparisonSection from '@/sections/cost-comparison-section';
import DemoPreviewSection from '@/sections/demo-preview-section';
import FaqSection from '@/sections/faq-section';
import HeroSection from '@/sections/hero-section';
import HowItWorksSection from '@/sections/how-it-works-section';
import MeetOurTeamSection from '@/sections/meet-our-team-section';
import ModulesSection from '@/sections/modules-section';
import OurPricingSection from '@/sections/our-pricing-section';
import OurTestimonialsSection from '@/sections/our-testimonials-section';
import ReplacesSection from '@/sections/replaces-section';
import UzbekistanSection from '@/sections/uzbekistan-section';

export default function Page() {
    return (
        <main className='w-full overflow-x-hidden flex flex-col'>
            <HeroSection />
            <ReplacesSection />
            <UzbekistanSection />
            <ModulesSection />
            <DemoPreviewSection />
            <HowItWorksSection />
            <CostComparisonSection />
            <MeetOurTeamSection />
            <OurTestimonialsSection />
            <OurPricingSection />
            <FaqSection />
            <CallToActionSection />
        </main>
    );
}
