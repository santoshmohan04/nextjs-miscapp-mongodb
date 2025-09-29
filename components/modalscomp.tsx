'use client';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { useFilterBookmarks } from '../contexts/FilterBookmarksContext';
import { bookmarksdata } from '@/components/data';

const ModalsComponent = () => {
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleClose = (data: string) => {
    if (data === 'AddBookmark') setShowAddBookmark(false);
    if (data === 'AddCategory') setShowAddCategory(false);
  };

  const handleShow = (data: string) => {
    if (data === 'AddBookmark') setShowAddBookmark(true);
    if (data === 'AddCategory') setShowAddCategory(true);
  };

  const { addBookmark, addCategory } = useFilterBookmarks();

  const [bookmarkPayload, setBookmarkPayload] = useState({
    title: '',
    url: '',
    icon: '',
    foldertitle: '',
  });

  const [title, setTitle] = useState('');

  const handleAddBookmark = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addBookmark(bookmarkPayload);
    setBookmarkPayload({ title: '', url: '', icon: '', foldertitle: '' });
    setShowAddBookmark(false);
  };

  const handleAddCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addCategory(title);
    setTitle('');
    setShowAddCategory(false);
  };

  const handleBookmarkPayloadChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setBookmarkPayload((prevState) => ({ ...prevState, [id]: value }));
  };

  return (
    <>
      <button
        className="btn btn-primary mx-3"
        onClick={() => handleShow('AddBookmark')}
      >
        Add Bookmark
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => handleShow('AddCategory')}
      >
        Add Category
      </button>
      <Modal show={showAddBookmark} onHide={() => handleClose('AddBookmark')}>
        <Modal.Header closeButton>
          <Modal.Title>Add Bookmark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddBookmark}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={bookmarkPayload.title}
                onChange={handleBookmarkPayloadChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="url" className="form-label">
                URL
              </label>
              <input
                type="url"
                className="form-control"
                id="url"
                value={bookmarkPayload.url}
                onChange={handleBookmarkPayloadChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="icon" className="form-label">
                Icon URL
              </label>
              <input
                type="url"
                className="form-control"
                id="icon"
                value={bookmarkPayload.icon}
                onChange={handleBookmarkPayloadChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="foltertitle" className="form-label">
                Folder
              </label>
              <select
                className="form-select"
                id="foltertitle"
                value={bookmarkPayload.foldertitle}
                onChange={handleBookmarkPayloadChange}
              >
                {bookmarksdata.map((folder, i) => (
                  <option value={folder.title} key={i}>
                    {folder.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Bookmark
            </button>
          </form>
        </Modal.Body>
      </Modal>
      <Modal show={showAddCategory} onHide={() => handleClose('AddCategory')}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddCategory}>
            <div className="mb-3">
              <label htmlFor="categoryTitle" className="form-label">
                Category Title
              </label>
              <input
                type="text"
                className="form-control"
                id="categoryTitle"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Category
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalsComponent;
