'use client';

import React, { createContext, useContext, useState } from 'react';

interface addBookMarkPayload {
  title: string;
  url: string;
  icon: string;
  foldertitle: string;
}

interface FilterBookmarksContextProps {
  filter: (searchTerm: string) => void;
  searchTerm: string;
  addBookmark: (payload: addBookMarkPayload) => void;
  bookmarkPayload: addBookMarkPayload;
  addCategory: (title: string) => void;
  title: string;
}

const FilterBookmarksContext = createContext<FilterBookmarksContextProps>({
  filter: () => {},
  searchTerm: '',
  addBookmark: () => {},
  bookmarkPayload: { title: '', url: '', icon: '', foldertitle: '' },
  addCategory: () => {},
  title: '',
});

export const useFilterBookmarks = () => useContext(FilterBookmarksContext);

interface FilterBookmarksProviderProps {
  children: React.ReactNode;
}

export const FilterBookmarksProvider: React.FC<
  FilterBookmarksProviderProps
> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookmarkPayload, setAddBookmark] = useState<addBookMarkPayload>({
    title: '',
    url: '',
    icon: '',
    folderTitle: '',
  });
  const [title, setAddCategory] = useState<string>('');

  const filter = (term: string) => {
    setSearchTerm(term);
  };

  const addCategory = (data: string) => {
    setAddCategory(data);
  };

  const addBookmark = (data: addBookMarkPayload) => {
    setAddBookmark(data);
  };

  return (
    <FilterBookmarksContext.Provider
      value={{
        filter,
        searchTerm,
        addCategory,
        bookmarkPayload,
        addBookmark,
        title,
      }}
    >
      {children}
    </FilterBookmarksContext.Provider>
  );
};
