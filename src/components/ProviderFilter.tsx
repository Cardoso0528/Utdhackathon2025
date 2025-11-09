import { Provider } from '@/types';
import { Button } from '@/components/ui/button';

interface ProviderFilterProps {
  providers: Provider[];
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
}

export default function ProviderFilter({ providers, selectedProvider, onProviderChange }: ProviderFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant={selectedProvider === provider.id ? 'default' : 'secondary'}
          onClick={() => onProviderChange(provider.id)}
          className="font-semibold transition-all"
        >
          {provider.name}
        </Button>
      ))}
    </div>
  );
}
