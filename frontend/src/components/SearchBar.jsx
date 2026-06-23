import { useState } from "react";

function SearchBar({ onSearch }) {

  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <form
      className="d-flex mb-4"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className="form-control me-2"
        placeholder="Search Courses..."
        value={keyword}
        onChange={(e) =>
          setKeyword(e.target.value)
        }
      />

      <button
        className="btn btn-primary"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;