import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ onError }) => {
    const buttonRef = useRef(null);
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        const handleCredentialResponse = async (response) => {
            try {
                await loginWithGoogle(response.credential);

                // Returning user with past reports -> straight to their history.
                // Brand new user -> the existing onboarding flow (dashboard).
                try {
                    const { data: reports } = await api.get('/health-reports/mine');
                    navigate(reports.length > 0 ? '/reports' : '/dashboard');
                } catch {
                    navigate('/dashboard');
                }
            } catch (err) {
                onError?.('Google sign-in failed. Please try again.');
            }
        };

        let cancelled = false;

        const init = () => {
            if (cancelled || !window.google?.accounts?.id) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'filled_black',
                    size: 'large',
                    shape: 'pill',
                    width: 360,
                });
            }
            setReady(true);
        };

        if (window.google?.accounts?.id) {
            init();
            return;
        }

        const interval = setInterval(() => {
            if (window.google?.accounts?.id) {
                clearInterval(interval);
                clearTimeout(timeout);
                init();
            }
        }, 100);

        // Google's script normally loads in well under a second. If it still
        // hasn't after 8s, something's actually wrong (blocked script, or an
        // unauthorized origin causing Google to never expose window.google.accounts.id) -
        // show that instead of polling forever with nothing visible.
        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (!cancelled) setLoadFailed(true);
        }, 8000);

        return () => {
            cancelled = true;
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [loginWithGoogle, navigate, onError]);

    if (!GOOGLE_CLIENT_ID) return null;

    if (loadFailed) {
        return (
            <p className="text-center text-xs text-rose-400/80 py-2">
                Google Sign-In couldn't load. Check your connection, disable ad/privacy blockers for this site, or try again shortly.
            </p>
        );
    }

    return <div ref={buttonRef} className="flex justify-center w-full" style={{ minHeight: ready ? 'auto' : 44 }} />;
};

export default GoogleSignInButton;
