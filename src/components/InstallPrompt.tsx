import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { promptInstall } from "@/utils/registerSW";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleShowPrompt = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('showInstallPrompt', handleShowPrompt);

    // Show iOS prompt if not already installed
    if (iOS) {
      const isStandalone = (window.navigator as any).standalone;
      if (!isStandalone) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('showInstallPrompt', handleShowPrompt);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 p-4 bg-card border-primary/30 shadow-lg z-50 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
          <Download className="h-5 w-5 text-background" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Install LiftLogKit</h3>
          
          {isIOS ? (
            <p className="text-sm text-muted-foreground mb-3">
              Tap the share button <span className="inline-block">📤</span> and select "Add to Home Screen"
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Get quick access and work offline! Install our app for the best experience.
              </p>
              <Button 
                onClick={handleInstall}
                className="w-full bg-gradient-primary hover:opacity-90"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};