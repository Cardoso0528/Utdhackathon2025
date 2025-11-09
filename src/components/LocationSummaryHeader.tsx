import { MapPin, Users, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationSummaryProps {
    city: string;
    state: string;
    population: number;
    chiScore: number;
}

export default function LocationSummary({ city, state, population, chiScore }: LocationSummaryProps) {
    const chiColor = chiScore >= 75 ? 'text-status-moderate' : chiScore >= 65 ? 'text-status-warning' : 'text-status-critical';

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="text-2xl font-bold">{city}, {state}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4" />
                        Population: {population.toLocaleString()}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Customer Health Index (CHI)</div>
                    <div className={`text-3xl font-bold ${chiColor}`}>{chiScore}</div>
                    <div className="flex items-center gap-1 text-xs text-status-critical mt-1">
                        <TrendingDown className="h-3 w-3" />
                        -2.4 from last month
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

