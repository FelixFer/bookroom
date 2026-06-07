"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ROOM_RULES = [
  "Your collection belongs only to you.",
  "Reading speed is not a competition.",
  "Books can be abandoned without guilt.",
  "Re-reading is always welcome.",
  "Every reader's journey is different.",
];

const QUOTES = [
  { text: "A reader lives a thousand lives before he dies.", author: "George R.R. Martin" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  { text: "A book is a dream you hold in your hands.", author: "Neil Gaiman" },
  { text: "One must always be careful of books, and what is inside them.", author: "Cassandra Clare" },
  { text: "We read to know we are not alone.", author: "C.S. Lewis" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
  { text: "Reading is dreaming with open eyes.", author: "Anissa Trisdianty" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Never trust anyone who has not brought a book with them.", author: "Lemony Snicket" },
  { text: "Until I feared I would lose it, I never loved to read. One does not love breathing.", author: "Harper Lee" },
  { text: "No two persons ever read the same book.", author: "Edmund Wilson" },
  { text: "Books may well be the only true magic.", author: "Alice Hoffman" },
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
  { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", author: "Carlos Ruiz Zafón" },
  { text: "That's the thing about books. They let you travel without moving your feet.", author: "Jhumpa Lahiri" },
  { text: "Some books leave us free and some books make us free.", author: "Ralph Waldo Emerson" },
  { text: "Reading is an exercise in empathy; an exercise in walking in someone else's shoes for a while.", author: "Malorie Blackman" },
  { text: "One glance at a book and you hear the voice of another person.", author: "Carl Sagan" },
  { text: "The world belongs to those who read.", author: "Rick Holland" },
  // From Bookroom itself
  { text: "Books wait patiently for the right moment to be opened.", author: "Bookroom" },
  { text: "Even a short reading session is time well spent.", author: "Bookroom" },
  { text: "The room is quiet, but the stories are alive.", author: "Bookroom" },
];

const SOCIAL_LINKS = [
  { label: "Website", href: "https://felixferdinand.vercel.app" },
  { label: "GitHub", href: "https://github.com/FelixFer" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/felix-frdnnd" },
  { label: "Instagram", href: "https://www.instagram.com/felferdinand" },
  { label: "Email", href: "mailto:felixfdnd@gmail.com" },
];

const MOBILE_PAGES = [
  "cover",
  "about",
  "credits",
  "quote",
] as const;

export default function AboutBookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [mobilePage, setMobilePage] = useState(0);

  useEffect(() => {
    if (openCount === 0) return;
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setMobilePage(0);
  }, [openCount]);

  function open() {
    setIsOpen(true);
    setOpenCount((c) => c + 1);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        className="about-book-trigger"
        onClick={open}
        aria-label="About Bookroom"
        title="About Bookroom"
      >
        <Image src="/icon/blue-book.svg" alt="About" loading="eager" width={52} height={52} />
      </button>

      {isOpen && (
        <>
          <div className="about-book-backdrop" onClick={close} />

          {/* Desktop book */}
          <div className="about-book-wrapper hidden sm:flex">
            <button className="about-book-close" onClick={close} aria-label="Close">×</button>
            <div className="book" key={openCount}>
              <input type="radio" name={`book-${openCount}`} id={`p1-${openCount}`} defaultChecked />

              {/* Front cover (right side, clicking opens book) */}
              <label className="page cover" htmlFor={`p3-${openCount}`}>
                <h1>Bookroom</h1>
              </label>
              {/* Back of front cover (left side when open) */}
              <label className="page cover back-cover-left" htmlFor={`p1-${openCount}`} />

              <input type="radio" name={`book-${openCount}`} id={`p3-${openCount}`} />

              {/* Right page of spread 1: About */}
              <label className="page" htmlFor={`p5-${openCount}`}>
                <div className="page-content">
                  <h2>About</h2>
                  <p>
                    A cozy personal library inspired by quiet evenings,
                    warm tea, and the joy of collecting stories.
                  </p>
                  <p>
                    Track what you read, organize your shelves,
                    write notes, and build your own reading space.
                  </p>
                </div>
                <span className="page-arrow">›</span>
              </label>
              {/* Left page of spread 1: Room Rules */}
              <label className="page" htmlFor={`p3-${openCount}`}>
                <div className="page-content">
                  <h2>Room Rules</h2>
                  <ul>
                    {ROOM_RULES.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                <span className="page-arrow page-arrow-left">‹</span>
              </label>

              <input type="radio" name={`book-${openCount}`} id={`p5-${openCount}`} />

              {/* Right page of spread 2: Credits */}
              <label className="page" htmlFor={`p7-${openCount}`}>
                <div className="page-content credits">
                  <h2>Made with random thought</h2>
                  <p className="version">v{process.env.APP_VERSION}</p>
                  <p>
                    Created by <strong>Felix Ferdinand</strong>
                    <br />
                    Indonesia 🇮🇩
                  </p>
                  <p className="social-links">
                    {SOCIAL_LINKS.map((s, i) => (
                      <span key={s.label}>
                        {i > 0 && " · "}
                        <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                      </span>
                    ))}
                  </p>
                  <p className="copyright">© 2026 Bookroom<br />All rights reserved.</p>
                </div>
                <span className="page-arrow">›</span>
              </label>
              {/* Left page of spread 2: Quote */}
              <label className="page" htmlFor={`p5-${openCount}`}>
                <div className="page-content quote-page">
                  <p className="quote-mark">"</p>
                  <p className="quote-text">{quote.text}</p>
                  <p className="quote-author">— {quote.author}</p>
                </div>
                <span className="page-arrow page-arrow-left">‹</span>
              </label>

              <input type="radio" name={`book-${openCount}`} id={`p7-${openCount}`} />

              {/* Back cover right */}
              <label className="page cover" htmlFor={`p9-${openCount}`} />
              {/* Back cover left */}
              <label className="page cover" htmlFor={`p7-${openCount}`} />

              <input type="radio" name={`book-${openCount}`} id={`p9-${openCount}`} />
            </div>
          </div>

          {/* Mobile single-page card */}
          <div className="about-mobile-card sm:hidden">
            <div className="mobile-card-header">
              <span className="mobile-page-indicator">
                {mobilePage + 1} / {MOBILE_PAGES.length}
              </span>
              <button className="mobile-close-btn" onClick={close} aria-label="Close">×</button>
            </div>

            <div className="mobile-card-body">
              {mobilePage === 0 && (
                <div className="mobile-cover">
                  <h1>Bookroom</h1>
                  <p>Your cozy reading space.</p>
                </div>
              )}
              {mobilePage === 1 && (
                <div>
                  <h2>About</h2>
                  <p>
                    A cozy personal library inspired by quiet evenings,
                    warm tea, and the joy of collecting stories.
                  </p>
                  <p>
                    Track what you read, organize your shelves,
                    write notes, and build your own reading space.
                  </p>
                  <h2 style={{ marginTop: "1.5rem" }}>Room Rules</h2>
                  <ul>
                    {ROOM_RULES.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {mobilePage === 2 && (
                <div className="credits">
                  <h2>Made with random thought</h2>
                  <p className="version">v{process.env.APP_VERSION}</p>
                  <p>
                    Created by <strong>Felix Ferdinand</strong>
                    <br />
                    Indonesia 🇮🇩
                  </p>
                  <p className="social-links">
                    {SOCIAL_LINKS.map((s, i) => (
                      <span key={s.label}>
                        {i > 0 && " · "}
                        <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                      </span>
                    ))}
                  </p>
                  <p className="copyright">© 2026 Bookroom<br />All rights reserved.</p>
                </div>
              )}
              {mobilePage === 3 && (
                <div className="quote-page">
                  <p className="quote-mark">"</p>
                  <p className="quote-text">{quote.text}</p>
                  <p className="quote-author">— {quote.author}</p>
                </div>
              )}
            </div>

            <div className="mobile-card-nav">
              <button
                className="mobile-nav-btn"
                onClick={() => setMobilePage((p) => p - 1)}
                disabled={mobilePage === 0}
              >
                ‹ Prev
              </button>
              <button
                className="mobile-nav-btn"
                onClick={() => setMobilePage((p) => p + 1)}
                disabled={mobilePage === MOBILE_PAGES.length - 1}
              >
                Next ›
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
