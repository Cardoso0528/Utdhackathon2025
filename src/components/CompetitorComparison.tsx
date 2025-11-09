import React, { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    CartesianGrid,
} from 'recharts';
import type { CompetitorData } from '../types';

type Props = {
    competitors: CompetitorData[];
    tmobileData?: CompetitorData;
};

const TM_PINK = '#E20074';
const OTHER_GRAY = '#A0A0A0';

const Tabs = ['CHI', 'Sentiment', 'Network', 'Value'] as const;

function formatTick(value: string, winnerName?: string) {
    return value === winnerName ? `${value} 🏆` : value;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white p-2 rounded border shadow-sm text-sm">
            <div className="font-semibold">{d.name}</div>
            <div>CHI: {d.chiScore}</div>
            <div>Signal: {d.signalStrength}%</div>
            <div>Avg Speed: {d.avgSpeed} Mbps</div>
            <div>Drop Rate: {d.dropRate}%</div>
            <div>Market Share: {d.marketShare}%</div>
        </div>
    );
};

const CompetitorComparisonPanel: React.FC<Props> = ({ competitors }) => {
    const [tab, setTab] = useState<typeof Tabs[number]>('CHI');

    const data = useMemo(() => {
        // normalize data keys for chart
        return competitors.map((c) => ({
            name: c.name,
            chiScore: c.chiScore,
            sentiment: Math.round(c.chiScore), // fallback
            network: c.signalStrength,
            value: c.marketShare ?? 0,
            signalStrength: c.signalStrength,
            avgSpeed: c.avgSpeed,
            dropRate: c.dropRate,
        }));
    }, [competitors]);

    const keyForTab = useMemo(() => {
        switch (tab) {
            case 'CHI':
                return 'chiScore';
            case 'Sentiment':
                return 'sentiment';
            case 'Network':
                return 'network';
            case 'Value':
                return 'value';
            default:
                return 'chiScore';
        }
    }, [tab]);

    const winnerName = useMemo(() => {
        const sorted = [...data].sort((a, b) => (b[keyForTab] as number) - (a[keyForTab] as number));
        return sorted[0]?.name;
    }, [data, keyForTab]);

    return (
        <section className="p-4 bg-white rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Competitor Comparison</h2>
                <div className="flex gap-2">
                    {Tabs.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-3 py-1 rounded-full text-sm ${t === tab ? 'bg-tmobile-pink text-white' : 'bg-gray-100'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" tickFormatter={(v) => formatTick(String(v), winnerName)} width={140} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={keyForTab} isAnimationActive animationDuration={900}>
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.name === 'T-Mobile' ? TM_PINK : OTHER_GRAY} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};

export default CompetitorComparisonPanel;
