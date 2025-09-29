'use client';

import React from 'react';
import { useFilterBookmarks } from '../contexts/FilterBookmarksContext';

const SearchInput = () => {
  const { filter } = useFilterBookmarks();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    filter(query);
  };

  return (
    <input
      type="text"
      id="search"
      className="form-control"
      placeholder="Search bookmarks..."
      onInput={handleInput}
    />
  );
};

export default SearchInput;
