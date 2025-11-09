import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import outageData from "@/data/outage-data.json";

interface StarRatingProps {
  rating?: number;
  count?: string;
}

export const StarRating = ({ rating, count }: StarRatingProps = {}) => {
  // Use provided props or fall back to outageData
  const displayRating = rating !== undefined 
    ? rating.toFixed(2) 
    : outageData.star_rating.current.split(" ")[0];
  const displayCount = count || outageData.star_rating.count;

  return (
    <Card className="p-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center h-full">
        <Star className="h-12 w-12 fill-primary text-primary mb-3" />
        <div className="text-5xl font-bold text-foreground leading-none mb-2">
          {displayRating}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          <div className="font-medium">User Rating</div>
          <div className="mt-1">{displayCount}</div>
        </div>
      </div>
    </Card>
  );
};

