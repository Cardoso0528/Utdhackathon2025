import { Signal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NetworkHealthProps {
    coverage: number;
    reliability: number;
    speed: number;

}

export default function NetworkHealth({ coverage, reliability, speed }: NetworkHealthProps) {
    const metrics = [
        { label: 'Coverage', value: coverage, color: 'bg-primary' },
        { label: 'Reliability', value: reliability, color: 'bg-att-blue' },
        { label: 'Speed', value: speed, color: 'bg-status-moderate' },
    ];

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Signal className="h-5 w-5 text-primary" />
                    Network Health
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {metrics.map((metric) => (
                    <div key={metric.label}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">{metric.label}</span>
                            <span className="text-muted-foreground">{metric.value}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );

}
