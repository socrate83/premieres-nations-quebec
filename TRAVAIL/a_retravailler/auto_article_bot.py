import time
import subprocess
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- CONFIGURATION ---
WATCHED_FOLDER = r"C:\premieres-nations-quebec\TRAVAIL\a_retravailler"
REPO_FOLDER = r"C:\premieres-nations-quebec"
ARTICLES_FOLDER = os.path.join(REPO_FOLDER, "articles")

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
            nom_html = f"{base_name}.html"
            destination_html = os.path.join(ARTICLES_FOLDER, nom_html)
            
            html_template = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{base_name.replace('-', ' ').title()}</title>
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <article>
        <h1>{base_name.replace('-', ' ').title()}</h1>
        <div class="content">
            {contenu_brut}
        </div>
    </article>
</body>
</html>
"""
            
            with open(destination_html, "w", encoding="utf-8") as f:
                f.write(html_template)
            print(f"[OK] Fichier HTML généré : {nom_html}")
            
            os.remove(file_path)
            
            os.chdir(REPO_FOLDER)
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", f"Ajout automatique de l'article {nom_html}"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("[SUCCÈS] Article commité et poussé sur GitHub avec succès !")
            
        except Exception as e:
            print(f"[ERREUR] Une erreur est survenue : {e}")

if __name__ == "__main__":
    if not os.path.exists(WATCHED_FOLDER):
        os.makedirs(WATCHED_FOLDER)
    if not os.path.exists(ARTICLES_FOLDER):
        os.makedirs(ARTICLES_FOLDER)
        
    event_handler = ArticleBotHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCHED_FOLDER, recursive=False)
    
    print(f"--- BOT ACTIF ---")
    print(f"Surveillance de : {WATCHED_FOLDER}")
    print("Glissez un fichier (ex: 82-les-wendats.txt) pour le publier.")
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()