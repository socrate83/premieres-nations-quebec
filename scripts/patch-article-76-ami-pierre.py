#!/usr/bin/env python3
"""Update article 76: Pierre is Jean-Claude's friend; carnets from his great-grandfather."""
import json
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "locales/articles/76-les-outils-de-chasse.json"

REPLACEMENTS = {
    "en": [
        (
            "<p><strong>Jean-Claude —</strong> My friend Pierre entrusted me with this account, written long ago: a travel notebook across Quebec's eleven nations, composed with the help of their knowledge. I pass it on to you as he wrote it — I invent nothing.</p>",
            "<p><strong>Jean-Claude —</strong> My friend Pierre shared with me the notebooks of stories left by his great-grandfather, written long ago: a travel notebook across Quebec's eleven nations, composed with the help of their knowledge. I pass it on to you as it was written — I invent nothing.</p>",
        ),
        (
            "<p><em>Here is the notebook Pierre gave me.</em></p>",
            "<p><em>Here is one of these notebooks, entrusted to me by Pierre.</em></p>",
        ),
        (
            "<strong>Note:</strong> Ancient text written by Pierre, with the help of the nations' knowledge — not by the First Nations themselves. Jean-Claude shares it as he received it, with respect for these writings and the traditions they describe. Techniques vary according to families and territories; the nations concerned remain the authorities of their own knowledge. Some methods described are today regulated or reserved for educational transmission.",
            "<strong>Note:</strong> Ancient text written by my friend Pierre's great-grandfather — Pierre le Fouineur, coureur des bois — with the help of the nations' knowledge, not by the First Nations themselves. Jean-Claude shares it as he received it, with respect for these writings and the traditions they describe. Techniques vary according to families and territories; the nations concerned remain the authorities of their own knowledge. Some methods described are today regulated or reserved for educational transmission.",
        ),
    ],
    "es": [
        (
            "<p><strong>Jean-Claude —</strong> Mi amigo Pierre me confió este relato, redactado hace mucho tiempo: un cuaderno de ruta a través de las once naciones de Quebec, compuesto con la colaboración de sus saberes. Te lo transmito tal como él lo escribió — no invento nada.</p>",
            "<p><strong>Jean-Claude —</strong> Mi amigo Pierre me hizo partícipe de los cuadernos de relatos dejados por su bisabuelo, redactados hace mucho tiempo: un cuaderno de ruta a través de las once naciones de Quebec, compuesto con la colaboración de sus saberes. Te lo transmito tal como fue escrito — no invento nada.</p>",
        ),
        (
            "<p><em>Aquí está el cuaderno que Pierre me entregó.</em></p>",
            "<p><em>Aquí está uno de esos cuadernos, confiado en mis manos por Pierre.</em></p>",
        ),
        (
            "<strong>Nota:</strong> Texto antiguo redactado por Pierre, con la colaboración de los saberes de las naciones — y no por las Primeras Naciones mismas. Jean-Claude lo transmite tal como lo recibió, con respeto por estos escritos y las tradiciones que describen. Las técnicas varían según las familias y los territorios; las naciones concernidas siguen siendo las autoridades de sus propios saberes. Algunos métodos descritos están hoy regulados o reservados a la transmisión pedagógica.",
            "<strong>Nota:</strong> Texto antiguo redactado por el bisabuelo de mi amigo Pierre — Pierre le Fouineur, coureur des bois — con la colaboración de los saberes de las naciones, y no por las Primeras Naciones mismas. Jean-Claude lo transmite tal como lo recibió, con respeto por estos escritos y las tradiciones que describen. Las técnicas varían según las familias y los territorios; las naciones concernidas siguen siendo las autoridades de sus propios saberes. Algunos métodos descritos están hoy regulados o reservados a la transmisión pedagógica.",
        ),
    ],
}


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for lang, pairs in REPLACEMENTS.items():
        html = data[lang]["html"]
        for old, new in pairs:
            if old not in html:
                raise SystemExit(f"missing in {lang}: {old[:70]}...")
            html = html.replace(old, new)
        data[lang]["html"] = html
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK")


if __name__ == "__main__":
    main()
