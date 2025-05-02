import React, { useEffect, useState, useContext } from "react";
import { Container, Card, Button, Accordion, Alert } from "react-bootstrap";
import UserContext from "../UserContext";

// Helper function returns the comment author name or a fallback value.
const getCommentAuthorName = (comment) => {
  if (comment.author && typeof comment.author === "object" && comment.author.username) {
    return comment.author.username;
  }
  if (typeof comment.author === "string") {
    return comment.author;
  }
  return "Anonymous";
};

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      setError("Unauthorized: Only admins can access this page.");
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const postsData = Array.isArray(data) ? data : data.posts || [];
        setPosts(postsData);
      })
      .catch(() => setError("Error fetching blog posts."));
  }, [user]);

  // Delete a blog post as admin
  const handleDeletePost = (postId) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/posts/${postId}/admin`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setPosts(posts.filter((post) => post._id !== postId));
      })
      .catch((error) => console.error("Error deleting post:", error));
  };

  // Delete a comment as admin
  const handleDeleteComment = (commentId, postId) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/blogs/comments/${commentId}/admin`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setPosts(
          posts.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              };
            }
            return post;
          })
        );
      })
      .catch((error) =>
        console.error("Error deleting comment:", error)
      );
  };

  return (
    <Container className="mt-4 admin-dashboard-container">
      {error && <Alert variant="danger">{error}</Alert>}
      {!error && (
        <>
          <h1 className="admin-dashboard-header mb-4">Admin Dashboard</h1>
          {posts.length === 0 ? (
            <p className="text-center">No posts available.</p>
          ) : (
            posts.map((post) => (
              <Card key={post._id} className="mb-4 admin-post-card">
                <Card.Header className="d-flex justify-content-between align-items-center admin-post-header">
                  <div>
                    <h5 className="admin-post-title">{post.title}</h5>
                    <small className="admin-post-author">
                      Author: {post.author?.username || "Unknown"}
                    </small>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDeletePost(post._id)}
                    className="admin-delete-post-btn"
                  >
                    Delete Post
                  </Button>
                </Card.Header>
                <Card.Body className="admin-post-body">
                  <Card.Text className="admin-post-content">{post.content}</Card.Text>
                  <Accordion className="admin-comments-accordion">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        Comments ({post.comments ? post.comments.length : 0})
                      </Accordion.Header>
                      <Accordion.Body>
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <Card key={comment._id} className="mb-2 admin-comment-card">
                              <Card.Body className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong className="admin-comment-author">
                                    {getCommentAuthorName(comment)}
                                  </strong>:{" "}
                                  <span className="admin-comment-content">
                                    {comment.content}
                                  </span>
                                </div>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment._id, post._id)}
                                  className="admin-delete-comment-btn"
                                >
                                  Delete
                                </Button>
                              </Card.Body>
                            </Card>
                          ))
                        ) : (
                          <p className="mb-0">No comments for this post.</p>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Card.Body>
              </Card>
            ))
          )}
        </>
      )}
    </Container>
  );
}
