import { useState, useEffect, useContext } from "react";
import { Modal, Card, Spinner, Form, Button, Accordion, Alert } from "react-bootstrap";
import UserContext from "../UserContext";

export default function SingleBlog({ show, onHide, blogId }) {
  const { user } = useContext(UserContext);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (!blogId) return; // Only fetch when an ID is provided

    const token = localStorage.getItem("token");

    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts/${blogId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setBlog(data.post);
          setEditedContent(data.post.content); // Set initial content for editing
        } else {
          throw new Error("Blog post not found.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setError("Failed to load the blog.");
        setLoading(false);
      });
  }, [blogId]);

  // Handle editing submission for the blog post
  const handleEditSubmit = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts/${blogId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: blog.title,
        content: editedContent,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.populatedPost) { // Using populatedPost field from your API
          setBlog(data.populatedPost);
          setEditing(false);
        } else {
          console.error("Failed to update blog post.");
        }
      })
      .catch((err) => console.error("Error updating blog post:", err));
  };

  // Handle deleting the blog post
  const handleDelete = () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts/${blogId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        onHide(); // Close the modal after deletion
      })
      .catch((err) => console.error("Error deleting blog post:", err));
  };

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts/${blogId}/comments`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content: comment }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.updatedPost) {
          setBlog(data.updatedPost);
          setComment(""); // Clear the comment field once posted
        }
      })
      .catch((err) => console.error("Error adding comment:", err));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <Modal.Title>{blog?.title}</Modal.Title>
        )}
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            <p className="text-muted">By {blog.author?.username || "Unknown"}</p>
            {editing ? (
              <Form onSubmit={handleEditSubmit} className="mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>Edit Post:</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit" className="me-2">
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </Form>
            ) : (
              <p>{blog.content}</p>
            )}

            {user.id === blog.author?._id && !editing && (
              <div className="mb-3">
                <Button variant="warning" className="me-2" onClick={() => setEditing(true)}>
                  Edit Post
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete Post
                </Button>
              </div>
            )}

            <Accordion className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  Comments ({blog.comments ? blog.comments.length : 0})
                </Accordion.Header>
                <Accordion.Body>
                  {blog.comments && blog.comments.length > 0 ? (
                    blog.comments.map((c) => (
                      <Card key={c._id} className="mb-2">
                        <Card.Body>
                          <Card.Subtitle className="mb-2 text-muted">
                            {c.author?.username || "Unknown"}
                          </Card.Subtitle>
                          <Card.Text>{c.content}</Card.Text>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {user.id && (
              <Form onSubmit={handleCommentSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Add a Comment:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Post Comment
                </Button>
              </Form>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
