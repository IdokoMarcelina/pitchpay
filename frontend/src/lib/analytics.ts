const ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID;

type EventParams = Record<string, string | number | boolean | undefined>;

class Analytics {
    private initialized = false;

    init() {
        if (this.initialized || !ANALYTICS_ID) return;
        
        if (typeof window !== 'undefined') {
            console.log('Analytics initialized:', ANALYTICS_ID);
            this.initialized = true;
        }
    }

    track(event: string, params?: EventParams) {
        if (!this.initialized) {
            this.init();
        }

        if (import.meta.env.DEV) {
            console.log('[Analytics]', event, params);
            return;
        }

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', event, params);
        }
    }

    page(name: string, params?: EventParams) {
        this.track('page_view', {
            page_name: name,
            ...params,
        });
    }

    identify(userId: string, traits?: EventParams) {
        this.track('identify', {
            user_id: userId,
            ...traits,
        });
    }
}

export const analytics = new Analytics();

export const trackPage = (path: string) => {
    analytics.page(path);
};

export const trackEvent = (event: string, params?: EventParams) => {
    analytics.track(event, params);
};
