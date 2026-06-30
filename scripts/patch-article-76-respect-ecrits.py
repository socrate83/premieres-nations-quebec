#!/usr/bin/env python3
"""Align article 76 i18n with Jean-Claude: ancient Pierre texts, not fiction."""
import json
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "locales/articles/76-les-outils-de-chasse.json"

REPLACEMENTS = {
    "en": [
        (
            "<p><strong>Jean-Claude —</strong> My friend Pierre entrusted me with this account: a travel notebook across Quebec's eleven nations, composed with the help of their knowledge. I pass it on to you as he wrote it.</p>",
            "<p><strong>Jean-Claude —</strong> My friend Pierre entrusted me with this account, written long ago: a travel notebook across Quebec's eleven nations, composed with the help of their knowledge. I pass it on to you as he wrote it — I invent nothing.</p>",
        ),
        (
            "<strong>Note:</strong> Composite narrative by Pierre, shared by Jean-Claude, with respect for the traditions of the First Nations of Quebec. Fictional characters and scenes; techniques vary according to families and territories; the nations concerned remain the authorities of their own knowledge. Some methods described are today regulated or reserved for educational transmission.",
            "<strong>Note:</strong> Ancient text written by Pierre, with the help of the nations' knowledge — not by the First Nations themselves. Jean-Claude shares it as he received it, with respect for these writings and the traditions they describe. Techniques vary according to families and territories; the nations concerned remain the authorities of their own knowledge. Some methods described are today regulated or reserved for educational transmission.",
        ),
    ],
    "es": [
        (
            "<p><strong>Jean-Claude —</strong> Mi amigo Pierre me confió este relato: un cuaderno de ruta a través de las once naciones de Quebec, compuesto con la colaboración de sus saberes. Te lo transmito tal como él lo escribió.</p>",
            "<p><strong>Jean-Claude —</strong> Mi amigo Pierre me confió este relato, redactado hace mucho tiempo: un cuaderno de ruta a través de las once naciones de Quebec, compuesto con la colaboración de sus saberes. Te lo transmito tal como él lo escribió — no invento nada.</p>",
        ),
        (
            "<strong>Nota:</strong> Relato compuesto firmado por Pierre, difundido por Jean-Claude, con respeto por las tradiciones de las Primeras Naciones de Quebec. Personajes y escenas ficticios; las técnicas varían según las familias y los territorios; las naciones concernidas siguen siendo las autoridades de sus propios saberes. Algunos métodos descritos están hoy regulados o reservados a la transmisión pedagógica.",
            "<strong>Nota:</strong> Texto antiguo redactado por Pierre, con la colaboración de los saberes de las naciones — y no por las Primeras Naciones mismas. Jean-Claude lo transmite tal como lo recibió, con respeto por estos escritos y las tradiciones que describen. Las técnicas varían según las familias y los territorios; las naciones concernidas siguen siendo las autoridades de sus propios saberes. Algunos métodos descritos están hoy regulados o reservados a la transmisión pedagógica.",
        ),
    ],
}


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for lang, pairs in REPLACEMENTS.items():
        html = data[lang]["html"]
        for old, new in pairs:
            if old not in html:
                raise SystemExit(f"missing in {lang}: {old[:60]}...")
            html = html.replace(old, new)
        data[lang]["html"] = html
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK")


if __name__ == "__main__":
    main()
