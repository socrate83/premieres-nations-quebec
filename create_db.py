import sqlite3, os, re

BASE_DIR = r"C:\Users\socra\OneDrive\Documents\Premieres_Nations_Quebec"
DB_PATH = os.path.join(BASE_DIR, "articles_premieres_nations.db")

articles = []
for nation in os.listdir(BASE_DIR):
    article_path = os.path.join(BASE_DIR, nation, "article_" + nation.lower() + ".md")
    if os.path.exists(article_path):
        with open(article_path, "r", encoding="utf-8") as f:
            content = f.read()
        title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        title = title_match.group(1) if title_match else nation
        word_count = len(content.split())
        # First 300 chars for intro preview
        preview = content.replace("\n", " ")[:300]
        articles.append((nation, title, content, word_count, preview, str(article_path)))

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("DROP TABLE IF EXISTS articles")
c.execute("""CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nation TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER,
    preview TEXT,
    file_path TEXT NOT NULL,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")

c.execute("DROP TABLE IF EXISTS autochthonous_terms")
c.execute("""CREATE TABLE autochthonous_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    term TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id)
)""")

for art in articles:
    c.execute("INSERT INTO articles (nation, title, content, word_count, preview, file_path) VALUES (?, ?, ?, ?, ?, ?)", art)

conn.commit()
conn.close()

print(f"Base creee: {DB_PATH}")
print(f"Articles importes: {len(articles)}")
for art in articles:
    print(f"  - {art[0]}: {art[1]} ({art[3]} mots)")
