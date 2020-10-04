import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import "./Home.css";


export default function Home() {
  const [notes, setNotes] = useState([]);
  const [originalNotes, setOriginalNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchContent, setSearchContent] = useState("");

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        setNotes(notes);
        setOriginalNotes(notes);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function loadNotes() {
    return API.get("notes", "/notes");
  }

  function handleSearchChange(e) {
    setSearchContent(e.target.value);
  }

  function updateNotes() {
    if (originalNotes.length == 0) {
      return;
    }

    setIsUpdating(true);

    var updatedNotes = originalNotes.filter(
      (note) => note.content.includes(searchContent)
    );
    
    setNotes(updatedNotes);
    setIsUpdating(false);
  }

  function renderNotesList(notes) {
    return [{}].concat(notes).map((note, i) =>
      i !== 0 ? (
        <LinkContainer key={note.noteId} to={`/notes/${note.noteId}`}>
          <ListGroupItem header={note.content.trim().split("\n")[0]}>
            {"Created: " + new Date(note.createdAt).toLocaleString()}
          </ListGroupItem>
        </LinkContainer>
      ) : (
        <LinkContainer key="new" to="/notes/new">
          <ListGroupItem>
            <h4>
              <b>{"\uFF0B"}</b> Create a new note
            </h4>
          </ListGroupItem>
        </LinkContainer>
      )
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p>A simple note taking app</p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  function renderLoader() {
    return (
      <div className="loader"></div>
    );
  }

  function renderNotes() {
    return (
      <div className="notes">
        <PageHeader>Your Notes</PageHeader>
        {renderSearchBar()}
        {(isLoading || isUpdating) ? renderLoader() : (
          <ListGroup>
            {!isLoading && renderNotesList(notes)}
          </ListGroup>
        )}
      </div>
    );
  }

  function renderSearchBar() {
    return (
      <div className="search-bar">
        <input type="text" className="form-control" id="form-control" onChange={handleSearchChange} placeholder="Search for content" aria-label="Search" aria-describedby="search-btn"></input>
        <div className="input-group-append">
          <button className="btn btn-search" type="button" id="search-btn" onClick={updateNotes}>Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
