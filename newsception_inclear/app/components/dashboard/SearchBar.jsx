import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="neomorphic rounded-2xl p-3 bg-[#e8e8e8] dark:bg-[#1a1a1a]">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search any topic... e.g., 'AI regulation', 'renewable energy'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 font-sans text-[#1a1a1a] dark:text-white placeholder:text-gray-500 text-lg"
          />
          <Button
            type="submit"
            className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] text-[#b8860b] dark:text-[#d4af37] hover:scale-105 transition-transform px-6"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </div>
      <p className="text-xs font-sans text-gray-500 dark:text-gray-600 mt-2 text-center">
        Powered by AI • Analyzing sources from across the political spectrum
      </p>
    </form>
  );
}