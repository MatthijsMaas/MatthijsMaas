"""Convert selected Substack export posts into Hugo page bundles (content/essays/<slug>/index.md).
Usage: python3 -I substack2hugo.py <export_dir> <out_dir> <post_id> [<post_id> ...]"""
import csv, html, json, re, subprocess, sys, urllib.parse
from pathlib import Path
from bs4 import BeautifulSoup

BLOG = "https://criticalmaas.substack.com"
exp, out, ids = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
meta = {r["post_id"].split(".")[0]: r for r in csv.DictReader(open(exp / "posts.csv", encoding="utf-8"))}
slugs = {i: meta[i]["post_id"].split(".", 1)[1] for i in ids}
slug_set = set(slugs.values())

def pandoc(fragment):
    r = subprocess.run(["pandoc", "-f", "html", "-t", "markdown_strict+pipe_tables+strikeout-raw_html", "--wrap=none"],
                       input=fragment, capture_output=True, text=True, check=True)
    return r.stdout.strip()

def img_src(s3):
    # Substack's image CDN, resized; the originals can be several megabytes.
    return "https://substackcdn.com/image/fetch/w_1200,c_limit,f_auto,q_auto:good/" + urllib.parse.quote(s3, safe="")

def local_link(href):
    m = re.match(r"https?://criticalmaas\.substack\.com/p/([^/?#]+)", href or "")
    if m and m.group(1) in slug_set:
        return f"/essays/{m.group(1)}/"
    # Unbalanced parentheses in a URL break Markdown links.
    return (href or "").replace("(", "%28").replace(")", "%29")

for pid in ids:
    row, slug = meta[pid], slugs[pid]
    src = next((exp / "posts").glob(f"{pid}.*.html"))
    soup = BeautifulSoup(src.read_text(encoding="utf-8"), "html.parser")

    # Footnotes: collect bodies, remove the list, replace anchors with tokens.
    notes = {}
    for fn in soup.select("div.footnote"):
        num = fn.select_one("a.footnote-number").get_text(strip=True)
        body = fn.select_one("div.footnote-content")
        for a in body.find_all("a", href=True):
            a["href"] = local_link(a["href"])
        parts = []
        for child in body.find_all(recursive=False):
            if child.name == "blockquote":
                q = " <br> ".join(pandoc(str(p)).replace("\n", " ") for p in child.find_all("p")) or pandoc(child.decode_contents())
                parts.append(f'<span class="note-quote">{q}</span>')
            elif child.find("img"):
                img = child.find("img")
                a = json.loads(img.get("data-attrs") or "{}")
                alt = html.escape((a.get("alt") or "").strip(), quote=True)
                parts.append(f'<img src="{img_src(a.get("src") or img["src"])}" alt="{alt}" loading="lazy">')
            elif child.name in ("ul", "ol"):
                parts.extend("– " + pandoc(li.decode_contents()).replace("\n", " ") for li in child.find_all("li"))
            else:
                t = pandoc(str(child)).replace("\n", " ")
                if t:
                    parts.append(t)
        notes[num] = " <br> ".join(parts)
        fn.decompose()
    for a in soup.select("a.footnote-anchor"):
        a.replace_with(f"ZZNOTE{a.get_text(strip=True)}ZZ")

    # Remove Substack furniture.
    for el in soup.select("div.subscription-widget-wrap-editor, p.button-wrapper, div.image-link-expand, form"):
        el.decompose()

    # Images: keep as figures with optional caption.
    figures = {}
    for k, cont in enumerate(soup.select("div.captioned-image-container")):
        img = cont.find("img")
        cap = cont.find("figcaption")
        attrs = json.loads(img.get("data-attrs") or "{}") if img else {}
        s3 = attrs.get("src") or (img["src"] if img else "")
        alt = (attrs.get("alt") or (img.get("alt") if img else "") or "").strip()
        cap_md = pandoc(cap.decode_contents()).replace("\n", " ") if cap and cap.get_text(strip=True) else ""
        figures[k] = (img_src(s3), alt or cap_md and BeautifulSoup(cap.decode_contents(), "html.parser").get_text(" ", strip=True) or "", cap_md)
        cont.replace_with(soup.new_string(f"ZZFIG{k}ZZ"))

    for a in soup.find_all("a", href=True):
        a["href"] = local_link(a["href"])

    # The page title is the only h1; the post's top heading level becomes h2.
    heads = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
    if heads:
        delta = 2 - min(int(h.name[1]) for h in heads)
        for h in heads:
            h.name = "h" + str(min(6, int(h.name[1]) + delta))

    md = pandoc(str(soup))
    for k, (s, alt, cap) in figures.items():
        alt_attr = html.escape(alt[:200], quote=True)
        block = f'<figure>\n<img src="{s}" alt="{alt_attr}" loading="lazy">\n'
        if cap:
            block += f"{{{{< marginnote >}}}}{cap}{{{{< /marginnote >}}}}\n"
        block += "</figure>"
        md = md.replace(f"ZZFIG{k}ZZ", "\n\n" + block + "\n\n")
    for num, body in notes.items():
        md = md.replace(f"ZZNOTE{num}ZZ", f"{{{{< sidenote >}}}}{body}{{{{< /sidenote >}}}}")
    leftovers = re.findall(r"ZZ(?:NOTE|FIG)\w+ZZ", md)
    md = re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"

    fm = {
        "title": row["title"].strip(),
        "subtitle": (row["subtitle"] or "").strip(),
        "date": row["post_date"],
        "substack_url": f"{BLOG}/p/{slug}",
    }
    lines = ["---"] + [f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in fm.items() if v] + ["---", ""]
    d = out / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.md").write_text("\n".join(lines) + md, encoding="utf-8")
    print(slug, len(md.split()), "words", len(notes), "notes", len(figures), "figs", "LEFTOVER" if leftovers else "", leftovers[:3])
