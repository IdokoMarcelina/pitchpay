import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPage } from '../lib/analytics';

export function useAnalytics() {
    const location = useLocation();

    useEffect(() => {
        trackPage(location.pathname);
    }, [location.pathname]);
}
