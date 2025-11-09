import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { ProblemBreakdown } from "@/components/ProblemBreakdown";
import { OutageList } from "@/components/OutageList";
import { USHeatmap } from "@/components/USHeatmap";
import { StarRating } from "@/components/StarRating";
import { OutageChart } from "@/components/OutageChart";
import { IssueReports } from "@/components/IssueReports";
import { CompanyPosts } from "@/components/CompanyPosts";
import { AlertCircle, Activity, MapPin, TrendingUp } from "lucide-react";
import outageData from "@/data/outage-data.json";

const Index = () => {
  const totalReports = outageData.latest_reports.length;
  const affectedCities = outageData.last_15_days_status.length;
  const topProblem = outageData.most_reported_problems[0];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Issue Reports & Company Posts */}
          <div className="lg:col-span-3 space-y-6">
            {outageData.issues_reports && <IssueReports reports={outageData.issues_reports} />}
            {outageData.company_posts && <CompanyPosts posts={outageData.company_posts} />}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Reports"
                value={totalReports}
                icon={Activity}
                variant="default"
              />
              <MetricCard
                title="Affected Cities"
                value={affectedCities}
                icon={MapPin}
                variant="warning"
              />
              <MetricCard
                title="Top Issue"
                value={topProblem.label}
                icon={AlertCircle}
                variant="destructive"
                trend={{ value: topProblem.percent, label: `${topProblem.percent}% of reports` }}
              />
              <MetricCard
                title="Trend"
                value="Monitoring"
                icon={TrendingUp}
                variant="success"
              />
            </div>

            {/* Heatmap */}
            <div className="mb-8">
              <USHeatmap locations={outageData.last_15_days_status} />
            </div>

            {/* 24 Hour Chart with Star Rating */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3">
                <OutageChart />
              </div>
              <StarRating />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProblemBreakdown problems={outageData.most_reported_problems} />
              <OutageList reports={outageData.latest_reports} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
