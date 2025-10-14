"use client";

import { bookmarksdata } from "@/components/data";
import React, { useState, useEffect } from "react";
import PaginationData from "./paginationdata";
import { useFilterBookmarks } from "../contexts/FilterBookmarksContext";

export default function BookmarksList() {
  const defaultIcon = "https://via.placeholder.com/32?text=B";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [filteredData, setFilteredData] = useState<Array<any>>(
    bookmarksdata.flatMap((folder) =>
      folder.children.map((child) => ({ ...child, folderTitle: folder.title }))
    )
  );
  const [categorizedData, setCategorizedData] = useState([]);
  const { searchTerm, bookmarkPayload, title } = useFilterBookmarks();

  useEffect(() => {
    displayBookmarks(filteredData, currentPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    filterBookmarks(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    onaddBookmark(bookmarkPayload);
  }, [bookmarkPayload]);

  useEffect(() => {
    onaddCategory(title);
  }, [title]);

  const displayBookmarks = (data: any, page = 1) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    const categorized_data = paginatedData.reduce((acc: any, bookmark: any) => {
      const folderTitle = bookmark.folderTitle || "Uncategorized";
      if (!acc[folderTitle]) {
        acc[folderTitle] = [];
      }
      acc[folderTitle].push(bookmark);
      return acc;
    }, {});

    const bookmarks: any = Object.keys(categorized_data).map(
      (folderTitle: any) => ({
        folderTitle,
        links: categorized_data[folderTitle],
      })
    );

    setCategorizedData(bookmarks);
  };

  const onImageError = (event: any) => {
    const target = event.target as HTMLImageElement;
    target.src = "https://via.placeholder.com/32?text=B";
  };

  const deleteBookmark = (title: string) => {
    const updatedData = filteredData.filter(
      (bookmark: any) => bookmark.title !== title
    );
    setFilteredData(updatedData);
  };

  const changePage = (event: any) => {
    setCurrentPage(event);
    displayBookmarks(filteredData, currentPage);
  };

  const filterBookmarks = (query: string) => {
    setFilteredData(
      bookmarksdata
        .flatMap((folder) =>
          folder.children.map((child) => ({
            ...child,
            folderTitle: folder.title,
          }))
        )
        .filter((bookmark) =>
          bookmark.title.toLowerCase().includes(query.toLowerCase())
        )
    );
    displayBookmarks(filteredData);
    setCurrentPage(1);
  };

  const onaddBookmark = (payload: any) => {
    const folder = bookmarksdata.find(
      (folder) => folder.title === payload.foldertitle
    );
    if (folder) {
      folder.children.push({
        type: "link",
        addDate: getDate(),
        title: payload.title,
        url: payload.url,
        icon: payload.icon,
      });
    } else {
      bookmarksdata.push({
        type: "folder",
        title: payload.foldertitle,
        addDate: getDate(),
        lastModified: getDate(),
        children: [
          {
            type: "link",
            addDate: getDate(),
            title: payload.title,
            url: payload.url,
            icon: payload.icon,
          },
        ],
      });
    }
    setFilteredData(
      bookmarksdata.flatMap((folder) =>
        folder.children.map((child) => ({
          ...child,
          folderTitle: folder.title,
        }))
      )
    );
    displayBookmarks(filteredData, currentPage);
  };

  const onaddCategory = (title: string) => {
    bookmarksdata.push({
      type: "folder",
      title,
      addDate: getDate(),
      lastModified: getDate(),
      children: [],
    });
    setFilteredData(
      bookmarksdata.flatMap((folder) =>
        folder.children.map((child) => ({
          ...child,
          folderTitle: folder.title,
        }))
      )
    );
    displayBookmarks(filteredData, currentPage);
  };

  const getDate = () => {
    // Get the current date
    const now = new Date();

    // Get the Unix timestamp (in seconds)
    const unixTimestamp = Math.floor(now.getTime() / 1000);

    return unixTimestamp;
  };

  return (
    <>
      <div id="bookmarks-container">
        {categorizedData.map((t: any, index) => (
          <div className="folder-title" key={index}>
            <h3>{t.folderTitle}</h3>
            <div className="row">
              {t.links.map((bookmark: any, i: number) => (
                <div key={i} className="col-md-4">
                  <div className="card bookmark-card">
                    <div className="card-body">
                      <h5 className="card-title">{bookmark.title}</h5>
                      <img
                        className="bookmark-icon"
                        src={bookmark.icon || defaultIcon}
                        alt="icon"
                        onError={(event) => onImageError(event)}
                      />
                      <a
                        className="btn btn-primary btn-sm"
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteBookmark(bookmark.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {filteredData.length >= 6 && (
        <PaginationData
          data={filteredData}
          currentpage={currentPage}
          itemsPerPage={itemsPerPage}
          changePage={changePage}
        />
      )}
    </>
  );
}
