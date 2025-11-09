import { FileText, Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
  target: any;
}

export default function ReportModal({ open, onClose, onGenerate, target }: ReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Coverage Report
          </DialogTitle>
          <DialogDescription>
            Create a detailed analysis report for the selected location or area.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="text-sm font-semibold mb-2">Report Details</div>
            {target?.city ? (
              <div className="text-sm text-muted-foreground">
                Location: {target.city}<br />
                Provider: {target.provider?.toUpperCase()}<br />
                Severity: {target.severity}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Custom location analysis
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Report will include network health metrics, competitor analysis, and trend data.
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onGenerate} className="gap-2">
            <Download className="h-4 w-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
