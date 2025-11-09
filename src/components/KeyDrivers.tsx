import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KeyDriversProps {
    positive: string[];
    negative: string[];
}

export default function KeyDrivers({ positive, negative }: KeyDriversProps) {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Key Drivers
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="text-sm font-semibold mb-2 text-status-moderate">Positive Factors</div>
                    <div className="flex flex-wrap gap-2">
                        {positive.map((factor, index) => (
                            <Badge key={index} variant="secondary" className="bg-status-moderate/20 text-status-moderate border-status-moderate/30">
                                {factor}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-sm font-semibold mb-2 text-status-critical">Negative Factors</div>
                    <div className="flex flex-wrap gap-2">
                        {negative.map((factor, index) => (
                            <Badge key={index} variant="secondary" className="bg-status-critical/20 text-status-critical border-status-critical/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {factor}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

