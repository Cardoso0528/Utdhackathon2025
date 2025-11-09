import React from 'react';
import { motion } from 'framer-motion';

export type AgentCardType = {
    icon: string;
    name: string;
    status: 'idle' | 'loading' | 'complete';
    result?: string;
};

const statusColor = (s: AgentCardType['status']) => {
    if (s === 'complete') return 'bg-emerald-500 text-white';
    if (s === 'loading') return 'bg-pink-200 text-gray-800';
    return 'bg-gray-100 text-gray-800';
};

const AgentCard: React.FC<{ agent: AgentCardType; index?: number }> = ({ agent }) => {
    return (
        <motion.div
            layout
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`w-44 h-28 rounded-xl shadow-md p-3 flex flex-col justify-between ${statusColor(agent.status)}`}
        >
            <div className="flex items-center gap-2">
                <div className="text-2xl">{agent.icon}</div>
                <div className="text-sm font-semibold">{agent.name}</div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-700">{agent.status === 'loading' ? <ThinkingDots /> : agent.status}</div>
                {agent.status === 'complete' && agent.result && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className="text-xs bg-white/30 px-2 py-1 rounded"
                    >
                        {agent.result}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const ThinkingDots: React.FC = () => (
    <span className="inline-block w-12 text-left">
        <span className="inline-block animate-pulse">·</span>
        <span className="inline-block animate-pulse delay-150">·</span>
        <span className="inline-block animate-pulse delay-300">·</span>
        <style>{`
      .delay-150{animation-delay:0.15s}
      .delay-300{animation-delay:0.3s}
      .animate-pulse{display:inline-block;opacity:0;animation:fade 1s infinite}
      @keyframes fade{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
    `}</style>
    </span>
);

export default AgentCard;
