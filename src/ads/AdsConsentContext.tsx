import React from "react";
import mobileAds, {
  AdsConsent,
  AdsConsentDebugGeography,
  AdsConsentPrivacyOptionsRequirementStatus,
  type AdsConsentInfo,
  type AdsConsentInfoOptions,
} from "react-native-google-mobile-ads";

type AdsConsentContextValue = {
  adsReady: boolean;
  consentLoading: boolean;
  consentError: string | null;
  privacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdsConsentContext = React.createContext<AdsConsentContextValue | undefined>(undefined);

const consentRequestOptions: AdsConsentInfoOptions | undefined = __DEV__
  ? { debugGeography: AdsConsentDebugGeography.EEA }
  : undefined;

export function AdsConsentProvider({ children }: { children: React.ReactNode }) {
  const mobileAdsStartedRef = React.useRef(false);
  const [adsReady, setAdsReady] = React.useState(false);
  const [consentLoading, setConsentLoading] = React.useState(true);
  const [consentError, setConsentError] = React.useState<string | null>(null);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = React.useState(false);

  const updatePrivacyOptionsState = React.useCallback((consentInfo: AdsConsentInfo) => {
    setPrivacyOptionsRequired(
      consentInfo.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    );
  }, []);

  const startMobileAdsIfAllowed = React.useCallback(
    async (consentInfo?: AdsConsentInfo) => {
      const currentConsentInfo = consentInfo ?? (await AdsConsent.getConsentInfo());
      updatePrivacyOptionsState(currentConsentInfo);

      if (!currentConsentInfo.canRequestAds) {
        setAdsReady(false);
        return;
      }

      if (!mobileAdsStartedRef.current) {
        mobileAdsStartedRef.current = true;
        await mobileAds().initialize();
      }

      setAdsReady(true);
    },
    [updatePrivacyOptionsState],
  );

  React.useEffect(() => {
    let isMounted = true;

    const runConsentFlow = async () => {
      try {
        setConsentLoading(true);
        setConsentError(null);

        await AdsConsent.requestInfoUpdate(consentRequestOptions);
        const consentInfo = await AdsConsent.loadAndShowConsentFormIfRequired();

        if (isMounted) {
          await startMobileAdsIfAllowed(consentInfo);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (__DEV__) {
          console.warn("Ad consent flow failed:", error);
        }

        if (isMounted) {
          setConsentError(message);

          try {
            await startMobileAdsIfAllowed();
          } catch (fallbackError) {
            if (__DEV__) {
              console.warn("Mobile Ads fallback initialization skipped:", fallbackError);
            }
          }
        }
      } finally {
        if (isMounted) {
          setConsentLoading(false);
        }
      }
    };

    runConsentFlow();

    return () => {
      isMounted = false;
    };
  }, [startMobileAdsIfAllowed]);

  const showPrivacyOptions = React.useCallback(async () => {
    try {
      const consentInfo = await AdsConsent.showPrivacyOptionsForm();
      updatePrivacyOptionsState(consentInfo);
      await startMobileAdsIfAllowed(consentInfo);
    } catch (error) {
      if (__DEV__) {
        console.warn("Privacy options form failed:", error);
      }
      throw error;
    }
  }, [startMobileAdsIfAllowed, updatePrivacyOptionsState]);

  const value = React.useMemo(
    () => ({
      adsReady,
      consentLoading,
      consentError,
      privacyOptionsRequired,
      showPrivacyOptions,
    }),
    [adsReady, consentError, consentLoading, privacyOptionsRequired, showPrivacyOptions],
  );

  return <AdsConsentContext.Provider value={value}>{children}</AdsConsentContext.Provider>;
}

export function useAdsConsent() {
  const context = React.useContext(AdsConsentContext);

  if (!context) {
    throw new Error("useAdsConsent must be used within AdsConsentProvider");
  }

  return context;
}
