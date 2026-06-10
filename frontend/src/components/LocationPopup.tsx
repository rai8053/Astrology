import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, X } from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import { setManualCountryOverride } from '@/lib/pricing';
import { useTranslation } from '@/lib/i18n';

const STORAGE_KEY = 'soma_location_asked';
const LOCATION_GRANTED_KEY = 'soma_location_granted';

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=2`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const countryCode = data?.address?.country_code?.toUpperCase();
    if (countryCode) return countryCode;
    return null;
  } catch {
    return null;
  }
}

export function LocationPopup() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const [handling, setHandling] = useState(false);

  useEffect(() => {
    const asked = localStorage.getItem(STORAGE_KEY);
    const granted = localStorage.getItem(LOCATION_GRANTED_KEY);
    if (!asked && !granted) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setHandling(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 86400000,
        });
      });
      const countryCode = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      if (countryCode) {
        setManualCountryOverride(countryCode);
        localStorage.setItem(LOCATION_GRANTED_KEY, 'true');
        window.location.reload();
        return;
      }
    } catch {
    }
    localStorage.setItem(LOCATION_GRANTED_KEY, 'false');
    setVisible(false);
    setHandling(false);
  };

  const handleNotNow = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(LOCATION_GRANTED_KEY, 'false');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-bg-primary dark:bg-dark-bg-secondary rounded-2xl border border-border-primary dark:border-dark-border-primary shadow-2xl max-w-sm w-full p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <button onClick={handleNotNow} className="p-1 -mr-1 -mt-1 ml-auto text-text-tertiary hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-1">
              {t('pricing.locationTitle')}
            </h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed mb-6">
              {t('pricing.locationDesc')}
            </p>

            <div className="flex flex-col gap-2">
              <PremiumButton
                variant="primary"
                className="w-full"
                onClick={handleAllow}
                loading={handling}
                icon={<Globe className="w-4 h-4" />}
              >
                {t('pricing.locationAllow')}
              </PremiumButton>
              <PremiumButton
                variant="ghost"
                className="w-full"
                onClick={handleNotNow}
                disabled={handling}
              >
                {t('pricing.locationNotNow')}
              </PremiumButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
