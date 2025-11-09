import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

type Winners = Record<string, string>;

type Props = {
    city?: string;
    chiScore?: number;
    winners?: Winners; // e.g. { CHI: 'T-Mobile', Sentiment: 'T-Mobile', Network: 'T-Mobile', Value: 'T-Mobile' }
    sound?: boolean;
    targetId?: string; // id of the CHI score element to shake
    auto?: boolean; // auto-trigger when conditions met
};

const DelightEffect: React.FC<Props> = ({ city = '', chiScore = 0, winners = {}, sound = true, targetId = 'chi-score', auto = true }) => {
    const [showToast, setShowToast] = useState(false);
    const triggeredRef = useRef(false);

    const isTMobileSweep = () => {
        const keys = ['CHI', 'Sentiment', 'Network', 'Value'];
        return keys.every((k) => (winners[k] || '').toLowerCase() === 't-mobile' || (winners[k] || '').toLowerCase() === 'tmobile');
    };

    const playSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 880;
            o.connect(g);
            g.connect(ctx.destination);
            g.gain.setValueAtTime(0, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
            o.start();
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
            o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.6);
            setTimeout(() => {
                try { o.stop(); ctx.close(); } catch (e) { }
            }, 1400);
        } catch (e) {
            // ignore audio errors
        }
    };

    const triggerDelight = (opts?: { soundOverride?: boolean }) => {
        if (triggeredRef.current) return;
        triggeredRef.current = true;

        // multiple bursts for a nicer effect
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        confetti({ particleCount: 40, spread: 120, origin: { y: 0.6 } });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.55 } });

        // show toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4500);

        // shake CHI element if present
        if (targetId) {
            const el = document.getElementById(targetId);
            if (el) {
                el.classList.add('delight-shake');
                setTimeout(() => el.classList.remove('delight-shake'), 900);
            }
        }

        // sound
        if ((opts && opts.soundOverride) || (!opts && sound)) playSound();
    };

    useEffect(() => {
        if (!auto) return;
        if (chiScore > 80 && isTMobileSweep()) {
            triggerDelight();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chiScore, winners]);

    return (
        <div aria-live="polite">
            <style>{`
                .delight-toast { position: fixed; right: 20px; top: 20px; z-index: 60; background: linear-gradient(90deg,#E20074,#E6007E); color: white; padding: 12px 16px; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); font-weight:600 }
                .delight-shake { animation: delight-shake 0.9s cubic-bezier(.36,.07,.19,.97) both }
                @keyframes delight-shake { 10%, 90% { transform: translate3d(-1px,0,0) } 20%,80% { transform: translate3d(2px,0,0) } 30%,50%,70% { transform: translate3d(-4px,0,0) } 40%,60% { transform: translate3d(4px,0,0) } }
            `}</style>

            {/* manual trigger for demo/testing */}
            <div className="fixed left-4 bottom-4 z-50">
                <button
                    onClick={() => { triggeredRef.current = false; triggerDelight({ soundOverride: true }); }}
                    className="px-3 py-2 rounded bg-tmobile-pink text-white shadow-md"
                >
                    🎉 Trigger Delight
                </button>
            </div>

            {showToast && (
                <div className="delight-toast">
                    🎉 T-Mobile dominates {city || 'this city'}!
                </div>
            )}
        </div>
    );
};

export default DelightEffect;
