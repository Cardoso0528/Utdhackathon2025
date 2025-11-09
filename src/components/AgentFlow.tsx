import React, { useEffect, useState } from 'react';
import AgentCard, { type AgentCardType } from './AgentCard';
import { motion } from 'framer-motion';

type Props = { agents?: AgentCardType[] };

const defaultAgents: AgentCardType[] = [
    { icon: '🧠', name: 'Sentiment Analyzer', status: 'idle', result: 'OK' },
    { icon: '📶', name: 'Network Analyzer', status: 'idle', result: 'OK' },
    { icon: '⚔️', name: 'Competitor Benchmark', status: 'idle', result: 'OK' },
    { icon: '💬', name: 'Feedback Aggregator', status: 'idle', result: 'OK' },
];

const AgentFlow: React.FC<Props> = ({ agents = defaultAgents }) => {
    const [states, setStates] = useState<AgentCardType[]>(agents);

    useEffect(() => {
        // sequential activation: idle -> loading -> complete with stagger
        let mounted = true;
        const total = states.length;
        const timers: number[] = [];
        const step = 500; // 0.5s stagger

        for (let i = 0; i < total; i++) {
            const start = window.setTimeout(() => {
                if (!mounted) return;
                setStates((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: 'loading' } : p)));
            }, i * step);
            timers.push(start);

            const done = window.setTimeout(() => {
                if (!mounted) return;
                setStates((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: 'complete', result: 'Done' } : p)));
            }, i * step + 1200); // loading lasts ~1.2s
            timers.push(done);
        }

        return () => {
            mounted = false;
            timers.forEach((t) => clearTimeout(t));
        };
    }, []);

    // simple SVG lines with draw animation using framer-motion
    const lineVariant = {
        hidden: { pathLength: 0 },
        visible: { pathLength: 1, transition: { duration: 1.2 } },
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto p-6">
            <div className="flex justify-center gap-6 items-center mb-6">
                <div className="flex flex-col items-center">
                    <AgentCard agent={states[0]} />
                </div>
            </div>

            <div className="flex justify-between items-start gap-6">
                <div className="flex items-center">
                    <AgentCard agent={states[1]} />
                </div>

                <div className="flex items-center">
                    <AgentCard agent={states[2]} />
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <AgentCard agent={states[3]} />
            </div>

            {/* SVG lines overlay */}
            <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
                <motion.path d="M400 100 L280 200" stroke="#cbd5e1" strokeWidth={3} fill="none" variants={lineVariant} initial="hidden" animate="visible" />
                <motion.path d="M400 100 L520 200" stroke="#cbd5e1" strokeWidth={3} fill="none" variants={lineVariant} initial="hidden" animate="visible" />
                <motion.path d="M280 240 L400 320" stroke="#cbd5e1" strokeWidth={3} fill="none" variants={lineVariant} initial="hidden" animate="visible" />
                <motion.path d="M520 240 L400 320" stroke="#cbd5e1" strokeWidth={3} fill="none" variants={lineVariant} initial="hidden" animate="visible" />
            </svg>
        </div>
    );
};

export default AgentFlow;
