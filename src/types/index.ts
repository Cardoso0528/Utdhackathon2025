// Core Data Types
export interface LocationData {
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
        lat: number;
        lon: number;
    };
    population: number;
    timestamp: string;
}

export interface Hotspot {
    id: number;
    lat: number;
    lng: number;
    city: string;
    severity: 'critical' | 'warning' | 'moderate';
    provider: string;
    outageCount: number;
    chi: number;
    duration: string;
}

export interface CompetitorData {
    name: string;
    marketShare: number;
    chiScore: number;
    signalStrength: number;
    avgSpeed: number;
    dropRate: number;
    color: string;
}

export interface AgentStatus {
    id: number;
    name: string;
    status: 'idle' | 'processing' | 'complete' | 'error';
    description: string;
    icon: string;
    processingTime?: number;
    result?: string;
}

export interface KeyDriver {
    id: string;
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    frequency: number;
    impact: number;
    category: 'network' | 'pricing' | 'support' | 'coverage' | 'features';
}

export interface NetworkMetric {
    name: string;
    value: number;
    unit: string;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    icon: string;
}

export interface CHIDataPoint {
    timestamp: string;
    score: number;
    date: string;
    hour: string;
}

export interface CustomerFeedback {
    id: string;
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    source: 'twitter' | 'survey' | 'app' | 'call';
    timestamp: string;
    location?: string;
}

export interface AnalysisResult {
    location: LocationData;
    chiScore: number;
    competitors: CompetitorData[];
    keyDrivers: KeyDriver[];
    networkHealth: NetworkMetric[];
    trendData: CHIDataPoint[];
    recentFeedback: CustomerFeedback[];
    summary: {
        totalInteractions: number;
        positiveSentiment: number;
        negativeSentiment: number;
        neutralSentiment: number;
        avgResponseTime: number;
    };
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    code: string;
    timestamp: string;
}

// WebSocket Message Types
export interface WSMessage {
    type: 'chi_update' | 'feedback' | 'agent_status' | 'network_metric';
    payload: any;
    timestamp: string;
}

// Component Props Types
export interface QueryPanelProps {
    onAnalyze: (city: string) => void;
    isLoading: boolean;
}

export interface MCPProcessVisualizerProps {
    agents: AgentStatus[];
    isActive: boolean;
}

export interface LocationSummaryHeaderProps {
    location: LocationData;
    chiScore: number;
    isAnimating?: boolean;
}

export interface CompetitorComparisonPanelProps {
    competitors: CompetitorData[];
    tmobileData: CompetitorData;
}

export interface KeyDriversPanelProps {
    drivers: KeyDriver[];
}

export interface NetworkHealthPanelProps {
    metrics: NetworkMetric[];
}

export interface TrendTimelineProps {
    data: CHIDataPoint[];
    currentScore: number;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface DashboardState {
    loadingState: LoadingState;
    currentLocation: LocationData | null;
    analysisResult: AnalysisResult | null;
    error: string | null;
    lastUpdated: string | null;
}