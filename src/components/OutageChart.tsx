import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import outageData from "@/data/outage-data.json";

export const OutageChart = () => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Last 24 Hours - Outage Reports</CardTitle>
        <p className="text-sm text-muted-foreground">Updated: {outageData.chart.alt_time}</p>
      </CardHeader>
      <CardContent>
        <div className="w-full flex items-center justify-center bg-secondary/20 rounded-lg p-4">
          <img 
            src={outageData.chart.image_src} 
            alt={`Outage chart for the last 24 hours, updated at ${outageData.chart.alt_time}`}
            className="w-full h-auto max-w-full"
            style={{ 
              maxHeight: '300px',
              filter: 'brightness(0.9) saturate(1.2) hue-rotate(-10deg)'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

