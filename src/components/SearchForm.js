import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { BsArrowRepeat } from "react-icons/bs";
import { EventEmitter } from "../libs/eventEmitter";

export default function SearchForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    handleQueryChange(event);
  }

  async function handleQueryChange(event) {
    setIsLoading(true);
    EventEmitter.dispatch('queryChange', event);
    setIsLoading(false);
  }

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
            />
            <InputGroup.Append>
              <InputGroup.Text id="basic-addon2">Search</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form>

      {isLoading && <BsArrowRepeat className="spinning"/>}
    </div>

  );
}
