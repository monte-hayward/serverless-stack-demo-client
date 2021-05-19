import React, { useState } from "react";
import PropTypes from 'prop-types';
import { API } from "aws-amplify";
import {
  Alert, Button, Form, InputGroup,
  Modal, Spinner, ToggleButton, ToggleButtonGroup
} from 'react-bootstrap';
import { BsArrowRepeat } from "react-icons/bs"; // BsX
import { EventEmitter } from "../libs/eventEmitter";
import "./SearchForm.css";
import { onError } from "../libs/errorLib";

function SearchForm({notes}) {

  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('find');
  const [query, setQuery] = useState('');
  const [replacementText, setReplacementText] = useState('');
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  const [showReplacementConfirmText, setShowReplacementConfirmText] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceDone, setReplaceDone] = useState(false);
  const [replaceCount, setReplaceCount] = useState(0);
  const [replaceError, setReplaceError] = useState(null);


  async function handleSubmit(event) {
    event.preventDefault();
    handleQueryChange(event);
  }

  async function handleQueryChange(event) {
    setIsLoading(true);
    setQuery(event.target.value);
    EventEmitter.dispatch('queryChange', event);
    setIsLoading(false);
  }

  async function handleReplacementTextChange(event) {
    setIsLoading(true);
    setReplacementText(event.target.value);
    EventEmitter.dispatch('replacementTextChange', event);
    setIsLoading(false);
  }

  async function handleFilterModeChange(event) {
    setIsLoading(true);
    setFilterMode(event);
    if (event === 'find') {
      handleReplacementTextChange({ target: { value: '' } })
    }
    EventEmitter.dispatch('filterModeChange', event);
    setIsLoading(false);
  }

  async function handleReplacementWarningClose() {
    setShowReplaceWarning(false);
  }
  async function handleReplaceSubmit(event) {
    event.preventDefault();
    setShowReplaceWarning(true);
    setShowReplacementConfirmText(true);
  }
  async function replaceAllInstances() {
    // query, replacementText
    const queue = notes.slice();
    const count = queue.length;

    for(let i = 0; i < count; i++) {
      const draft = Object.assign({}, queue.pop());
      const {noteId} = draft;
      let {content} = draft;
      const re = new RegExp(query, 'gi');
      content = String(content).replace(re, replacementText);
      draft.content = content;
      try {
        await API.put("notes", `/notes/${noteId}`, {
          body: draft,
        });
      } catch(error) {
        setReplaceError(error);
        onError(error);
      }
    }
    return count;
  }
  async function handleReplaceModalConfirm(event) {
    event.preventDefault();
    setShowReplacementConfirmText(false);
    setReplacing(true);
    const count = await replaceAllInstances();
    setReplacing(false);
    setReplaceDone(true);
    setReplaceCount(count);
  }
  async function clearError(){
    setReplaceError(null);
  }

  const disableReplaceSubmit = filterMode !== 'replace' || !query;

  return (
    <div className="SearchForm">
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Text to Search"
              aria-label="Text to Search"
              onChange={handleQueryChange}
              aria-describedby="basic-addon2"
              className="QueryInput"
            />
            {filterMode === 'replace' &&
            <Form.Control
              name="replacementText"
              placeholder="Replacement Text"
              aria-label="Replacement Text"
              onChange={handleReplacementTextChange}
              aria-describedby="basic-addon2"
            />
            }
            <InputGroup.Append>
              <Button
                type="reset"
                variant="light"
                className="ClearButton"
              >x</Button>
            </InputGroup.Append>

            <ToggleButtonGroup
              name="filterMode"
              onChange={handleFilterModeChange}
              type="radio"
              as={InputGroup.Append}
              variant="outline-secondary"
              id="input-group-dropdown-2"
            >
              <ToggleButton value="find" variant="secondary">Find</ToggleButton>
              <ToggleButton value="replace" variant="secondary">Replace</ToggleButton>
            </ToggleButtonGroup>

            <InputGroup.Append>
              <Button
                type="submit"
                onClick={handleReplaceSubmit}
                disabled={disableReplaceSubmit}
              >Submit</Button>
            </InputGroup.Append>

          </InputGroup>
        </Form.Group>
      </Form>

      {isLoading && <BsArrowRepeat className="spinning"/>}
      {showReplaceWarning && 'hello'}
      <Modal>
        <Alert key="replaceAlertControl" variant="danger" dismissible onClose={handleReplacementWarningClose}>
          Replace instances of &quot;{query}&quot; with &quot;{replacementText}&quot;?{' '}
          <Alert.Link href="#" variant="danger">Confirm</Alert.Link>{' '}
          <Alert.Link href="#">Cancel</Alert.Link>
        </Alert>
      </Modal>

      <Modal show={showReplaceWarning} onHide={handleReplacementWarningClose}>
        <Modal.Header closeButton>
          <Modal.Title>Replace All Instances</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showReplacementConfirmText &&
            <span>Modify all your Notes that have instances of &quot;{query}&quot;,
            replacing with &quot;{replacementText}&quot;?</span>
          }
          {replacing &&
            <>
              <Spinner animation="border">
                <span className="sr-only">Replacing...</span>
              </Spinner>
              <span>Replacing all instances of &quot;{query}&quot;
              with &quot;{replacementText}&quot; ...</span>
            </>
          }
          {replaceDone && !replaceError &&
            <span>{replaceCount ? `${replaceCount} Notes have been updated` : null}</span>
          }
          {replaceError && replaceDone &&
            <Alert variant="danger" onClose={clearError} dismissible>
              <Alert.Heading>An error occurred.</Alert.Heading>
              <p>
                ${replaceError}
              </p>
            </Alert>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleReplacementWarningClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReplaceModalConfirm} disabled={replaceDone}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>


    </div>

  );
}
SearchForm.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.object),
};

export default SearchForm;
