import { useState, useEffect, useContext } from "react";
import { Container, Card, Spinner, Button } from "react-bootstrap";
import UserContext from "../UserContext";
import SingleBlog from "./SingleBlog"; // Modal for viewing/editing a blog post
import CreateBlog from "./CreateBlog"; // Modal for creating a new blog post

export default function BlogList() {
  const { user } = useContext(UserContext);
  const [blogs, setBlogs] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to control the SingleBlog modal
  const [modalShow, setModalShow] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  // State to control the CreateBlog modal
  const [createModalShow, setCreateModalShow] = useState(false);

  // Function to fetch and update posts, sorting them to show the newest posts first.
  const reloadPosts = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/blogs/posts`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.posts && Array.isArray(data.posts)) {
          // Sort the posts by createdAt so that newest are first.
          const sortedPosts = data.posts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setBlogs(sortedPosts);
        } else {
          throw new Error("Invalid blog post data.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blog posts.");
        setLoading(false);
      });
  };

  useEffect(() => {
    // If the user is not logged in, skip fetching posts.
    if (!user?.id) {
      setLoading(false);
      return;
    }
    reloadPosts();
  }, [user]);

  // Handler for opening the SingleBlog modal
  const handleOpenModal = (blogId) => {
    setSelectedBlogId(blogId);
    setModalShow(true);
  };

  // If the user is not logged in, show the message.
  if (!user?.id) {
    return (
      <Container className="mt-4 blog-list-container" style={{ textAlign: "center" }}>
        <h2 className="mt-3">You must be logged in to see the posts</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-4 blog-list-container">
      <h1>Latest Blog Posts</h1>

      {/* Show "Create Blog" button only for logged-in users */}
      <Button
        variant="success"
        className="mb-3 create-blog-btn"
        onClick={() => setCreateModalShow(true)}
      >
        + Create New Blog Post
      </Button>

      {loading && <Spinner animation="border" />} {/* Show spinner while loading */}
      {error && <p className="text-danger">{error}</p>}
      {!loading && blogs.length === 0 && <p>No blog posts available.</p>}

      {blogs.map((blog) => (
        <Card key={blog._id} className="blog-card">
          <Card.Body>
            <Card.Title className="blog-card-title">{blog.title}</Card.Title>
            <Card.Subtitle className="mb-2 blog-card-subtitle">
              By {blog.author?.username || "Unknown"}
            </Card.Subtitle>
            <Card.Text className="blog-card-text">
              {blog.content?.slice(0, 100)}...
            </Card.Text>
            <Button
              variant="link"
              className="read-more-link"
              onClick={() => handleOpenModal(blog._id)}
            >
              Read More
            </Button>
          </Card.Body>
        </Card>
      ))}

      {/* Render the SingleBlog modal; reloadPosts is passed so that any updates trigger a refresh */}
      <SingleBlog
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          reloadPosts();
        }}
        blogId={selectedBlogId}
      />

      {/* Render the CreateBlog modal; reloadPosts is passed to update the list after a new post */}
      <CreateBlog
        show={createModalShow}
        onHide={() => {
          setCreateModalShow(false);
          reloadPosts();
        }}
      />
    </Container>
  );
}
