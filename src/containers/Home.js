import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { BsArrowRepeat, BsPencilSquare } from "react-icons/bs";
import ListGroup from "react-bootstrap/ListGroup";
import { LinkContainer } from "react-router-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { EventEmitter } from "../libs/eventEmitter";
import SearchForm from "../components/SearchForm";
import "./Home.css";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const lower = (text) => String.prototype.toLowerCase.call(text);


  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState('find');
  useEffect(() => {
    EventEmitter.subscribe('filterModeChange', (e) => setFilterMode(e));
    EventEmitter.subscribe('queryChange', (e) => setQuery(e.target.value));
    return () => {
      EventEmitter.unsubscribe('filterModeChange', (e) => setFilterMode(e));
      EventEmitter.unsubscribe('queryChange', (e) => setQuery(e.target.value));
    };
  });

  useEffect(() => {

    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        if (query) {
          setNotes(notes.filter(({ content }) => lower(content).includes(lower(query))));
        } else {
          setNotes(notes);
        }
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated, query]);

  function loadNotes() {

    return API.get("notes", "/notes");
  }


  function renderNotesList(notes) {
    const showReplaceWarning = filterMode === 'replace' && query;

    return (
      <>
        <LinkContainer to="/notes/new" disabled={filterMode === 'replace'}>
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17}/>
            <span className="ml-2 font-weight-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {isLoading && <BsArrowRepeat className="spinning"/>}
        {notes.map(({ noteId, content, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action
                            variant={showReplaceWarning ? 'warning' : undefined}
            >
              <span className="font-weight-bold">
                {content.trim().split("\n")[0]}
              </span>
              <br/>
              <span className="text-muted">
                Created: {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        <div className="pt-3">
          <Link to="/login" className="btn btn-info btn-lg mr-3">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <SearchForm notes={notes}/>
        <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
