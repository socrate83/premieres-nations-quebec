import time
import subprocess
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

WATCHED_FOLDER = r"C:\premieres-nations-quebec\TRAVAIL\a_retravailler"
REPO_FOLDER = r"C:\premieres-nations-quebec"
INDEX_FILE = os.path.join(REPO_FOLDER, "index.html")

class ArticleBotHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        file_path = event.src_path
        file_name = os.path.basename(file_path)
        if not file_name.endswith(('.txt', '.md')):
            return
        print(f"\n[+] Nouveau contenu détecté : {file_name}")
        time.sleep(2)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                contenu_brut = f.read()
            base_name = os.path.splitext(file_name)[0]
            nom_html = base_name + ".html"
            destination_html = os.path.join(REPO_FOLDER, nom_html)
            titre_propre = base_name.replace("-", " ").title()

            html_template = "<!DOCTYPE html>\n<html lang='fr'>\n<head>\n    <meta charset='UTF-8'>\n    <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n    <title>" + titre_propre + "</title>\n    <link rel='stylesheet' href='style.css'>\n    <link rel='stylesheet' href='lang-switcher.css'>\n    <script src='article-i18n.js' defer></script>\n    <script src='article-share.js' defer></script>\n    <script src='lang-switcher.js' defer></script>\n</head>\n<body>\n    <article>\n        <h1>" + titre_propre + "</h1>\n        <div class='content'>\n" + contenu_brut + "\n        </div>\n    </article>\n</body>\n</html>"

            with open(destination_html, "w", encoding="utf-8") as f:
                f.write(html_template)
            print(f"[OK] Fichier HTML généré : {nom_html}")

            if os.path.exists(INDEX_FILE):
                with open(INDEX_FILE, "r", encoding="utf-8") as f:
                    index_content = f.read()
                nouveau_lien = '<li><a href="' + nom_html + '">' + titre_propre + '</a></li>\n</ul>'
                if "</ul>" in index_content:
                    index_content = index_content.replace("</ul>", nouveau_lien, 1)
                else:
                    index_content += '\n<br><a href="' + nom_html + '">' + titre_propre + '</a>'
                with open(INDEX_FILE, "w", encoding="utf-8") as f:
                    f.write(index_content)
                print("[OK] index.html mis à jour.")

            os.remove(file_path)
            os.chdir(REPO_FOLDER)
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", "Mise en forme article " + nom_html], check=True)
            subprocess.run(["git", "push"], check=True)
            print("[SUCCÈS] Poussé sur GitHub avec succès !")
        except Exception as e:
            print(f"[ERREUR] {e}")

if __name__ == "__main__":
    if not os.path.exists(WATCHED_FOLDER):
        os.makedirs(WATCHED_FOLDER)
    event_handler = ArticleBotHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCHED_FOLDER, recursive=False)
    print("--- BOT ACTIF ---")
    print("Surveillance de : " + WATCHED_FOLDER)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
