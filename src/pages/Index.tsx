import { useState } from 'react';
import { Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CoverageMap from '@/components/CoverageMap';
import ProviderFilter from '@/components/ProviderFilter';
import LocationSummary from '@/components/LocationSummary';
import NetworkHealth from '@/components/NetworkHealth';
import KeyDrivers from '@/components/KeyDrivers';
import CompetitorComparison from '@/components/CompetitorComparison';
import TrendChart from '@/components/TrendChart';
import ReportModal from '@/components/ReportModal';
import { hotspots, providers, mockAnalysisResult } from '@/mocks/index.mock';
import { Hotspot } from '@/types';

const Index = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<any>(null);
  const [analysis] = useState(mockAnalysisResult);

  const filteredHotspots = selectedProvider === 'all'
    ? hotspots
    : hotspots.filter(h => h.provider === selectedProvider);

  const getAnalysisForHotspot = (hotspot: Hotspot) => {
    return {
      ...analysis,
      location: {
        ...analysis.location,
        city: hotspot.city.split(',')[0],
        state: hotspot.city.split(', ')[1],
      },
      chiScore: hotspot.chi,
    };
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setReportTarget({ type: 'point', coords });
    setShowReportModal(true);
  };

  const generateReport = () => {
    if (!reportTarget) return;

    const payload: any = {
      generatedAt: new Date().toISOString(),
      target: reportTarget
    };

    if (reportTarget.city) {
      payload.analysis = getAnalysisForHotspot(reportTarget);
    } else if (reportTarget.type === 'point') {
      payload.analysis = {
        note: 'Point selection - no hotspot analysis',
        coords: reportTarget.coords
      };
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coverage-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowReportModal(false);
  };

  const currentAnalysis = selectedHotspot
    ? getAnalysisForHotspot(selectedHotspot)
    : analysis;

  // Transform data to match component expectations
  const networkHealthData = {
    coverage: 85,
    reliability: 92,
    speed: 88,
  };

  const keyDriversData = {
    positive: currentAnalysis.keyDrivers
      .filter(kd => kd.sentiment === 'positive')
      .slice(0, 5)
      .map(kd => kd.text),
    negative: currentAnalysis.keyDrivers
      .filter(kd => kd.sentiment === 'negative')
      .slice(0, 5)
      .map(kd => kd.text),
  };

  const trendsData = currentAnalysis.trendData.slice(0, 24).map(td => ({
    date: td.hour,
    value: td.score,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                Network Coverage Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Real-time network analysis and insights</p>
            </div>
            <Button
              onClick={() => {
                setReportTarget(selectedHotspot || { type: 'general' });
                setShowReportModal(true);
              }}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filter Section */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filter by Provider</h2>
          </div>
          <ProviderFilter
            providers={providers}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
        </div>

        {/* Map and Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section - 2 columns */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-4 h-[600px]">
              <CoverageMap
                hotspots={filteredHotspots}
                onHotspotClick={handleHotspotClick}
                onMapClick={handleMapClick}
              />
            </div>
          </div>

          {/* Analytics Section - 1 column */}
          <div className="space-y-6">
            <LocationSummary
              city={currentAnalysis.location.city}
              state={currentAnalysis.location.state}
              population={currentAnalysis.location.population}
              chiScore={currentAnalysis.chiScore}
            />
            <NetworkHealth
              coverage={networkHealthData.coverage}
              reliability={networkHealthData.reliability}
              speed={networkHealthData.speed}
            />
          </div>
        </div>

        {/* Bottom Analytics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KeyDrivers
            positive={keyDriversData.positive}
            negative={keyDriversData.negative}
          />
          <CompetitorComparison competitors={currentAnalysis.competitors} />
          <TrendChart trends={trendsData} />
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={generateReport}
        target={reportTarget}
      />
    </div>
  );
};

export default Index;
