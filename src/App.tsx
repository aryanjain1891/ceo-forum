import React from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Types
interface LegacyProfile {
  id: string;
  name: string;
  image_url: string;
  description: string;
  one_liner: string;
  tenure_start: string;
  tenure_end: string | null;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  created_at: string;
  legacy_profiles?: {
    name: string;
  };
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  legacy_profile_id: string;
  legacy_profiles?: {
    name: string;
  };
}

interface Contribution {
  id: string;
  title: string;
  resource_url: string;
  description: string;
  created_at: string;
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const legacyProfileId = sessionStorage.getItem('legacyProfileId');
  
  if (!legacyProfileId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Components
const Navigation = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('legacyProfileId');

  const handleLogout = () => {
    sessionStorage.removeItem('legacyProfileId');
    navigate('/');
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="border-b border-gray-300 p-4">
      <div className="max-w-4xl mx-auto flex justify-between">
        <div className="flex gap-6">
          <Link to="/legacy" className="hover:underline">Legacy</Link>
          <Link to="/forum" className="hover:underline">Forum</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
        </div>
        <button onClick={handleLogout} className="hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
};

const Login = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error: queryError } = await supabase
      .from('legacy_auth')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (queryError || !data) {
      setError('Invalid username or password');
      return;
    }

    sessionStorage.setItem('legacyProfileId', data.legacy_profile_id);
    navigate('/legacy');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white">
      <h1 className="text-2xl mb-6">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" className="border border-black px-4 py-2">
          Login
        </button>
      </form>
    </div>
  );
};

const Legacy = () => {
  const [profiles, setProfiles] = React.useState<LegacyProfile[]>([]);

  React.useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('legacy_profiles')
        .select('*')
        .order('tenure_start');
      
      if (data) setProfiles(data);
    };

    fetchProfiles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl mb-6">Legacy Leaders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map(profile => (
          <Link to={`/legacy/${profile.id}`} key={profile.id} className="border p-4">
            <img src={profile.image_url} alt={profile.name} className="w-full h-48 object-cover" />
            <h2 className="mt-2 text-xl">{profile.name}</h2>
            <p className="text-gray-600">
              {profile.tenure_start} - {profile.tenure_end || 'Present'}
            </p>
            <p className="mt-2 text-sm italic">{profile.one_liner}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const LegacyProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = React.useState<LegacyProfile | null>(null);
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [forumPosts, setForumPosts] = React.useState<ForumPost[]>([]);
  const [contributions, setContributions] = React.useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = React.useState({
    title: '',
    resource_url: '',
    description: ''
  });
  const legacyProfileId = sessionStorage.getItem('legacyProfileId');

  React.useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('legacy_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch blogs
      const { data: blogData } = await supabase
        .from('blogs')
        .select('*')
        .eq('legacy_profile_id', id);
      
      if (blogData) setBlogs(blogData);

      // Fetch forum posts
      const { data: forumData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('legacy_profile_id', id);
      
      if (forumData) setForumPosts(forumData);

      // Fetch contributions
      const { data: contributionData } = await supabase
        .from('contributions')
        .select('*')
        .eq('legacy_profile_id', id);
      
      if (contributionData) setContributions(contributionData);
    };

    fetchProfileData();
  }, [id]);

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    await supabase
      .from('contributions')
      .insert([{
        ...newContribution,
        legacy_profile_id: id
      }]);

    setNewContribution({ title: '', resource_url: '', description: '' });
    
    // Refresh contributions
    const { data } = await supabase
      .from('contributions')
      .select('*')
      .eq('legacy_profile_id', id);
    
    if (data) setContributions(data);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="mb-8">
        <img src={profile.image_url} alt={profile.name} className="w-full h-64 object-cover" />
        <h1 className="text-3xl mt-4">{profile.name}</h1>
        <p className="text-gray-600">
          Tenure: {profile.tenure_start} - {profile.tenure_end || 'Present'}
        </p>
        <p className="mt-2 italic">{profile.one_liner}</p>
        <p className="mt-4">{profile.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl mb-4">Blog Posts</h2>
          <div className="space-y-4">
            {blogs.map(blog => (
              <article key={blog.id} className="border p-4">
                <Link to={`/blog/${blog.id}`}>
                  <h3 className="text-xl hover:underline">{blog.title}</h3>
                </Link>
                <p className="text-gray-600 mt-2">
                  Posted on {new Date(blog.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl mb-4">Forum Posts</h2>
          <div className="space-y-4">
            {forumPosts.map(post => (
              <article key={post.id} className="border p-4">
                <h3 className="text-xl">{post.title}</h3>
                <p className="mt-2">{post.content}</p>
                <p className="text-gray-600 mt-2">
                  Posted on {new Date(post.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Contributions</h2>
        <div className="space-y-4">
          {contributions.map(contribution => (
            <article key={contribution.id} className="border p-4">
              <h3 className="text-xl">
                <a href={contribution.resource_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {contribution.title}
                </a>
              </h3>
              <p className="mt-2">{contribution.description}</p>
              <p className="text-gray-600 mt-2">
                Added on {new Date(contribution.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </div>

      {legacyProfileId === id && (
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Add New Contribution</h2>
          <form onSubmit={handleContributionSubmit} className="border p-4">
            <div className="mb-4">
              <label className="block mb-2">Title:</label>
              <input
                type="text"
                value={newContribution.title}
                onChange={(e) => setNewContribution(prev => ({ ...prev, title: e.target.value }))}
                className="border p-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Resource URL:</label>
              <input
                type="url"
                value={newContribution.resource_url}
                onChange={(e) => setNewContribution(prev => ({ ...prev, resource_url: e.target.value }))}
                className="border p-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Description:</label>
              <textarea
                value={newContribution.description}
                onChange={(e) => setNewContribution(prev => ({ ...prev, description: e.target.value }))}
                className="border p-2 w-full h-32"
                required
              />
            </div>
            <button type="submit" className="border border-black px-4 py-2">
              Add Contribution
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const Forum = () => {
  const [posts, setPosts] = React.useState<ForumPost[]>([]);
  const [newPost, setNewPost] = React.useState({ title: '', content: '' });
  const legacyProfileId = sessionStorage.getItem('legacyProfileId');

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, legacy_profiles(name)')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legacyProfileId) return;

    await supabase
      .from('forum_posts')
      .insert([{
        title: newPost.title,
        content: newPost.content,
        legacy_profile_id: legacyProfileId
      }]);

    setNewPost({ title: '', content: '' });
    fetchPosts();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl mb-6">Forum</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 border p-4">
        <div className="mb-4">
          <label className="block mb-2">Title:</label>
          <input
            type="text"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Content:</label>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            className="border p-2 w-full h-32"
            required
          />
        </div>
        <button type="submit" className="border border-black px-4 py-2">
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="border p-4">
            <h2 className="text-xl">{post.title}</h2>
            <p className="mt-2">{post.content}</p>
            <p className="text-gray-600 mt-2">
              Posted by {post.legacy_profiles?.name} on {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Blog = () => {
  const [blogs, setBlogs] = React.useState<Blog[]>([]);

  React.useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('*, legacy_profiles(name)')
        .order('created_at', { ascending: false });
      
      if (data) setBlogs(data);
    };

    fetchBlogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl mb-6">Blog</h1>
      <div className="space-y-6">
        {blogs.map(blog => (
          <article key={blog.id} className="border p-4">
            <Link to={`/blog/${blog.id}`}>
              <h2 className="text-xl hover:underline">{blog.title}</h2>
            </Link>
            <p className="text-gray-600 mt-2">
              Posted by {blog.legacy_profiles?.name} on {new Date(blog.created_at).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = React.useState<Blog | null>(null);

  React.useEffect(() => {
    const fetchBlog = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('*, legacy_profiles(name)')
        .eq('id', id)
        .single();
      
      if (data) setBlog(data);
    };

    fetchBlog();
  }, [id]);

  if (!blog) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <article className="prose">
        <h1 className="text-3xl mb-4">{blog.title}</h1>
        <p className="text-gray-600 mb-8">
          Posted by {blog.legacy_profiles?.name} on {new Date(blog.created_at).toLocaleDateString()}
        </p>
        <div className="whitespace-pre-wrap">{blog.content}</div>
      </article>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-black">
        <Navigation />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/legacy" element={
            <ProtectedRoute>
              <Legacy />
            </ProtectedRoute>
          } />
          <Route path="/legacy/:id" element={
            <ProtectedRoute>
              <LegacyProfile />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />
          <Route path="/blog" element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          } />
          <Route path="/blog/:id" element={
            <ProtectedRoute>
              <BlogPost />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;