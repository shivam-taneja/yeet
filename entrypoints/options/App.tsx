import { useSettings } from "@/hooks/use-settings";
import { Header } from "@/components/options/header";
import { CrossPostingRules } from "@/components/options/cross-posting-rules";
import { PreferencesCard } from "@/components/options/preferences-card";
import { SupportCard } from "@/components/options/support-card";
import { Footer } from "@/components/options/footer";

export default function App() {
  const { isLoading } = useSettings();

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-cream font-body text-ink flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 md:px-8 selection:bg-mint/30">
      <div className="w-full max-w-5xl">
        <Header />

        <div className="flex flex-col gap-6 mb-6">
          <CrossPostingRules />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PreferencesCard />
            <SupportCard />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
