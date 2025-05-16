import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchBarProps {
  onSearch: (searchParams: { query?: string; startDate?: string; endDate?: string }) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    // Only include parameters that have values
    const searchParams = {
      ...(query && { query }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
    
    onSearch(searchParams);
  };

  const handleClear = () => {
    setQuery('');
    setStartDate('');
    setEndDate('');
    onSearch({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="query">Search</Label>
          <Input
            id="query"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleSearch} className="flex-1">Search</Button>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
        </div>
      </div>
    </div>
  );
}
