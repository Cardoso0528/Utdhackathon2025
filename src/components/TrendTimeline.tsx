import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import type { CHIDataPoint } from '../types';

type Props = {
    data: CHIDataPoint[];
    height?: number;
    currentScore?: number;
};

const TrendTimeline: React.FC<Props> = ({ data, height = 220, currentScore }) => {
    // show last 24 hours if possible
    const filtered = useMemo(() => {
        if (!data || data.length === 0) return [] as CHIDataPoint[];
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000;
        const last24 = data.filter((d) => new Date(d.timestamp).getTime() >= cutoff);
        return last24.length ? last24 : data;
    }, [data]);

    const lastPoint = filtered.length ? filtered[filtered.length - 1] : undefined;

    const timeFormatter = (ts: string) => {
        try {
            const d = new Date(ts);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return ts;
        }
    };

    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (!payload) return null;
        const isCurrent = lastPoint && payload.timestamp === lastPoint.timestamp;
        if (!isCurrent) return <circle cx={cx} cy={cy} r={3} fill="#E20074" />;
        return (
            <g>
                <defs>
                    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#E20074" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#E20074" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E20074" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx={cx} cy={cy} r={10} fill="url(#glowGrad)">
                    <animate attributeName="r" values="8;12;8" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#E20074" strokeWidth={2} />
            </g>
        );
    };

    return (
        <section className="p-4 bg-white rounded shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Trend Timeline (CHI)</h2>
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    <LineChart data={filtered}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tickFormatter={timeFormatter} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)} labelFormatter={(l: any) => timeFormatter(l)} />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#E20074"
                            strokeWidth={2}
                            dot={<CustomDot />}
                            isAnimationActive={true}
                            animationDuration={900}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};

export default TrendTimeline;
