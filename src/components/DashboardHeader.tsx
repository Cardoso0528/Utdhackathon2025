import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const DashboardHeader = () => {
  const location = useLocation();

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img 
                src="/tmobile-logo.png" 
                alt="T-Mobile Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">T-Mobile Outage Monitor</h1>
                <p className="text-sm text-muted-foreground">Real-time service status tracking</p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <Link to="/">
                <Button 
                  variant={location.pathname === "/" ? "default" : "ghost"}
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/tmobile-report">
                <Button 
                  variant={location.pathname === "/tmobile-report" ? "default" : "ghost"}
                  size="sm"
                >
                  T-Mobile Report
                </Button>
              </Link>
              <Link to="/comparison">
                <Button 
                  variant={location.pathname === "/comparison" ? "default" : "ghost"}
                  size="sm"
                >
                  Comparison
                </Button>
              </Link>
            </nav>
          </div>
          <Button size="lg" className="gap-2 text-base font-semibold">
            <FileText className="h-5 w-5" />
            Generate Report
          </Button>
        </div>
      </div>
    </header>
  );
};
