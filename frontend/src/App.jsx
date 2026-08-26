import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">💬</div>
          <h2>ChatSphere</h2>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className="login-btn">Log In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content">
          <div className="tag">🚀 Simple. Fast. Connected.</div>

          <h1>
            Conversations that
            <span> bring people together.</span>
          </h1>

          <p>
            ChatSphere is a simple and modern messaging platform that helps
            you connect, chat, and share moments with your friends.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Start Chatting →
            </button>

            <button className="secondary-btn">
              Learn More
            </button>
          </div>

          <div className="users">
            <div className="avatars">
              <span>👩</span>
              <span>👨</span>
              <span>🧑</span>
            </div>
            <p>Join people already chatting on ChatSphere</p>
          </div>
        </div>

        {/* Chat Demo */}
        <div className="chat-preview">
          <div className="chat-header">
            <div className="profile">
              <div className="avatar">A</div>
              <div>
                <h3>Alex Johnson</h3>
                <span>● Online</span>
              </div>
            </div>

            <div className="dots">•••</div>
          </div>

          <div className="messages">
            <div className="message received">
              Hey! 👋 How are you doing?
            </div>

            <div className="message sent">
              I'm good! Just checking out this new chat app 😄
            </div>

            <div className="message received">
              It looks amazing! 🔥
            </div>

            <div className="message sent">
              Right? Let's start chatting! 🚀
            </div>
          </div>

          <div className="message-input">
            <span>Type a message...</span>
            <button>➤</button>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="features" id="features">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Messaging</h3>
          <p>Send and receive messages instantly with your friends.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Connect Easily</h3>
          <p>Create conversations and stay connected with everyone.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Chats</h3>
          <p>Your conversations are designed to stay private and secure.</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <h3>💬 ChatSphere</h3>
        <p>Connecting people, one message at a time.</p>
        <span>© 2026 ChatSphere. Demo Project.</span>
      </footer>
    </div>
  );
}

export default App;