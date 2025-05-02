import { useState, useContext } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import UserContext from "../UserContext";

export default function CreateBlog({ show, onHide }) {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submitting new blog post...", { title, content });

    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Create response:", data);
        if (data.updatedPost) {
          // Close the modal on success
          onHide();
        } else {
          setError("Failed to create blog post. Server response: " + JSON.stringify(data));
        }
      })
      .catch((error) => {
        console.error("Error creating blog post:", error);
        setError("An error occurred while creating the post.");
      });
  };

  if (!user.id) {
    return <Alert variant="danger">You must be logged in to create a blog post.</Alert>;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create a New Blog Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} className="create-blog-form">
          <Form.Group className="mb-3">
            <Form.Label className="create-blog-label">Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="create-blog-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="create-blog-label">Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Write your blog content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="create-blog-textarea"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="create-blog-button">
            Publish Post
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
