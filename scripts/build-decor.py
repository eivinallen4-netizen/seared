"""
Turns the raw decor generations in assets-src/decor/originals/ into web-ready
textures, overlays and masks under public/, and fails when a size budget is blown.

    python scripts/build-decor.py            # build everything that has a source
    python scripts/build-decor.py paper-tile # build one asset

What each family needs (see assets-src/briefs/decor-system.md):
  tiles        flatten lighting, make seamless, normalise colour + contrast
  light layers generated on black -> real alpha (no blend modes needed in CSS)
  ink masks    generated black-on-white -> white RGB + alpha (colour comes from CSS)
  burnt paper  paper colour -> transparent so the section's own paper shows through
  grain        pure maths (AI noise shows its repeat)

Requires Pillow + numpy.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "decor" / "originals"
CUT = ROOT / "assets-src" / "decor"  # background-removed objects land here
PREVIEW = ROOT / "assets-src" / "decor" / "previews"
PUBLIC = ROOT / "public"

CHAR = np.array([18, 14, 11], dtype=np.float32)  # --char #120e0b
BUDGET_KB: dict[str, int] = {}  # public-relative path -> max KB
built: list[tuple[str, float]] = []


# --------------------------------------------------------------------------- io
def load(name: str, folder: Path = SRC) -> Image.Image | None:
    p = folder / f"{name}.png"
    if not p.exists():
        print(f"  missing  {p.relative_to(ROOT)}")
        return None
    return Image.open(p)


def save(img: Image.Image, rel: str, budget_kb: int, **opts) -> None:
    out = PUBLIC / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    if rel.endswith(".webp"):
        opts.setdefault("method", 6)
    if rel.endswith(".png"):
        opts.setdefault("optimize", True)
    img.save(out, **opts)
    kb = out.stat().st_size / 1024
    BUDGET_KB[rel] = budget_kb
    built.append((rel, kb))
    flag = "" if kb <= budget_kb else f"   OVER BUDGET ({budget_kb} KB)"
    print(f"  wrote    public/{rel}  {img.size[0]}x{img.size[1]}  {kb:.0f} KB{flag}")


def arr(img: Image.Image, mode: str = "RGB") -> np.ndarray:
    return np.asarray(img.convert(mode), dtype=np.float32)


def to_img(a: np.ndarray, mode: str | None = None) -> Image.Image:
    return Image.fromarray(np.clip(a + 0.5, 0, 255).astype(np.uint8), mode)


def lum(a: np.ndarray) -> np.ndarray:
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def smoothstep(lo: float, hi: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def blur(a: np.ndarray, radius: float) -> np.ndarray:
    """Gaussian blur (FFT, reflect-padded) for float arrays of any size."""
    if a.ndim == 3:
        return np.stack([blur(a[..., c], radius) for c in range(a.shape[2])], axis=-1)
    pad = int(min(radius * 3 + 1, a.shape[0] - 1, a.shape[1] - 1))
    p = np.pad(a.astype(np.float32), pad, mode="reflect")
    fy = np.fft.fftfreq(p.shape[0])[:, None]
    fx = np.fft.rfftfreq(p.shape[1])[None, :]
    kernel = np.exp(-2 * (np.pi**2) * (radius**2) * (fx**2 + fy**2))
    out = np.fft.irfft2(np.fft.rfft2(p) * kernel, s=p.shape)
    return out[pad : p.shape[0] - pad, pad : p.shape[1] - pad].astype(np.float32)


def center_square(img: Image.Image, inset: float = 0.04) -> Image.Image:
    """Largest centred square, minus a small inset (generations often vignette at the rim)."""
    w, h = img.size
    s = int(min(w, h) * (1 - 2 * inset))
    x, y = (w - s) // 2, (h - s) // 2
    return img.crop((x, y, x + s, y + s))


# ------------------------------------------------------------------------ tiles
def flatten(a: np.ndarray, radius_frac: float = 0.12) -> np.ndarray:
    """Remove large-scale lighting so nothing reads as a blotch when the tile repeats."""
    low = blur(a, a.shape[0] * radius_frac)
    return a - low + low.mean(axis=(0, 1), keepdims=True)


def seamless(a: np.ndarray) -> np.ndarray:
    """Variance-preserving blend of the image with its half-rolled copy: edges wrap, detail survives."""
    h, w = a.shape[:2]
    rolled = np.roll(a, (h // 2, w // 2), axis=(0, 1))
    y = np.abs(np.linspace(-1, 1, h))[:, None]
    x = np.abs(np.linspace(-1, 1, w))[None, :]
    d = np.maximum(x, y)  # 0 centre -> 1 edge
    wa = 1 - smoothstep(0.55, 0.98, d)  # original in the middle
    wb = 1 - wa  # rolled copy at the rim (its rim is the original's continuous middle)
    if a.ndim == 3:
        wa, wb = wa[..., None], wb[..., None]
    mean = a.mean(axis=(0, 1), keepdims=True)
    return mean + (wa * (a - mean) + wb * (rolled - mean)) / np.sqrt(wa**2 + wb**2)


def normalise(a: np.ndarray, mean_rgb: tuple[int, int, int], std: float) -> np.ndarray:
    """Pin the tile to an exact mean colour and luminance contrast, whatever the generation gave us."""
    target = np.array(mean_rgb, dtype=np.float32)
    dev = a - a.mean(axis=(0, 1), keepdims=True)
    dev *= std / max(float(lum(dev).std()), 1e-6)
    return target + dev


def tile_preview(img: Image.Image, name: str, n: int = 3, cell: int = 384) -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    small = img.convert("RGB").resize((cell, cell), Image.LANCZOS)
    sheet = Image.new("RGB", (cell * n, cell * n))
    for i in range(n):
        for j in range(n):
            sheet.paste(small, (i * cell, j * cell))
    sheet.save(PREVIEW / f"{name}-3x3.png")


def seam_score(a: np.ndarray) -> float:
    """Mean jump across the wrap seam relative to the mean jump between neighbouring rows/cols inside."""
    g = lum(a) if a.ndim == 3 else a
    inner = (np.abs(np.diff(g, axis=0)).mean() + np.abs(np.diff(g, axis=1)).mean()) / 2
    wrap = (np.abs(g[0] - g[-1]).mean() + np.abs(g[:, 0] - g[:, -1]).mean()) / 2
    return float(wrap / max(inner, 1e-6))


def build_paper_tile() -> None:
    src = load("paper-tile")
    if not src:
        return
    a = arr(center_square(src).resize((1024, 1024), Image.LANCZOS))
    a = normalise(seamless(flatten(a)), (240, 223, 187), std=4.6)
    print(f"  seam score {seam_score(a):.2f} (1.0 = invisible)")
    img = to_img(a)
    tile_preview(img, "paper-tile")
    save(img, "textures/paper-tile.webp", 140, quality=86)
    # Greyscale version for multiply over any paper-coloured surface (cards, drawer, ticket).
    g = lum(a)
    g = 242 + (g - g.mean()) * 1.3
    save(to_img(g).convert("L"), "textures/paper-tile-mult.webp", 110, quality=82)


def build_char_tile() -> None:
    src = load("char-tile")
    if not src:
        return
    a = arr(center_square(src).resize((1024, 1024), Image.LANCZOS))
    a = normalise(seamless(flatten(a)), (22, 17, 13), std=2.6)
    a = np.clip(a, [11, 8, 6], [44, 34, 26])
    print(f"  seam score {seam_score(a):.2f} (1.0 = invisible)")
    img = to_img(a)
    # Preview brightened x4 so seams would be visible to the eye.
    tile_preview(to_img(np.clip((a - 8) * 4, 0, 255)), "char-tile")
    save(img, "textures/char-tile.webp", 110, quality=90)


def build_grit_tile() -> None:
    src = load("grit-tile")
    if not src:
        return
    g = lum(arr(center_square(src).resize((512, 512), Image.LANCZOS)))
    g = seamless(flatten(g, 0.08))
    # Speckles only darken: keep the field near white and stretch the dark tail to ~62%.
    g = g - np.percentile(g, 70)
    g = 255 + np.minimum(g, 0) * (97 / max(float(-np.percentile(g, 0.3)), 1e-6))
    g = np.clip(g, 150, 255)
    print(f"  seam score {seam_score(g):.2f} (1.0 = invisible)")
    img = to_img(g).convert("L")
    tile_preview(img, "grit-tile")
    save(img, "textures/grit-tile.webp", 40, quality=76)


def build_paper_stain() -> None:
    src = load("paper-stain")
    if not src:
        return
    img = src.convert("RGB").resize((1600, round(1600 * src.height / src.width)), Image.LANCZOS)
    a = arr(img)
    # Multiply overlay: lift so the centre is true white and never darkens body copy.
    centre = np.percentile(lum(a), 90)
    a = np.clip(a * (255 / max(centre, 1)), 0, 255)
    save(to_img(a), "textures/paper-stain.webp", 160, quality=62)


# -------------------------------------------------------------------- ink masks
def ink_mask(name: str, out: str, width: int, budget: int, pad: int = 10) -> None:
    src = load(name)
    if not src:
        return
    g = lum(arr(src))
    alpha = smoothstep(40, 215, 255 - g)  # white -> 0, black -> 1
    alpha[alpha < 0.06] = 0
    ys, xs = np.where(alpha > 0.35)
    if not len(xs):
        print(f"  {name}: nothing found")
        return
    # Keep only the main stroke: drop rows that are far away from the densest band.
    row_mass = (alpha > 0.35).sum(axis=1)
    core = np.where(row_mass > row_mass.max() * 0.04)[0]
    y0, y1 = max(core.min() - pad, 0), min(core.max() + pad, alpha.shape[0] - 1)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, alpha.shape[1] - 1)
    alpha = alpha[y0 : y1 + 1, x0 : x1 + 1]
    h = max(round(width * alpha.shape[0] / alpha.shape[1]), 8)
    a_img = to_img(alpha * 255).convert("L").resize((width, h), Image.LANCZOS)
    rgba = Image.merge("RGBA", (Image.new("L", a_img.size, 255),) * 3 + (a_img,))
    print(f"  {name}: aspect {width / h:.1f}:1")
    save(rgba, out, budget, quality=80, alpha_quality=85)


# ----------------------------------------------------------------- light layers
def black_to_alpha(a: np.ndarray, floor: float = 10, gamma: float = 0.8) -> np.ndarray:
    """RGB on black -> straight-alpha RGBA. alpha = brightest channel, colour un-premultiplied."""
    peak = a.max(axis=-1)
    alpha = np.clip((peak - floor) / (255 - floor), 0, 1) ** gamma
    safe = np.maximum(peak, 1)[..., None]
    rgb = np.clip(a / safe * 255, 0, 255)
    # Where almost nothing is there, pull colour toward ember so edges never go grey.
    weak = (alpha < 0.08)[..., None]
    rgb = np.where(weak, np.array([255, 122, 26], dtype=np.float32), rgb)
    return np.dstack([rgb, alpha * 255])


def edge_fade(alpha: np.ndarray, left=0.0, right=0.0, top=0.0, bottom=0.0) -> np.ndarray:
    h, w = alpha.shape
    x = np.linspace(0, 1, w)[None, :]
    y = np.linspace(0, 1, h)[:, None]
    m = np.ones_like(alpha)
    if left:
        m = m * smoothstep(0, left, x)
    if right:
        m = m * smoothstep(0, right, 1 - x)
    if top:
        m = m * smoothstep(0, top, y)
    if bottom:
        m = m * smoothstep(0, bottom, 1 - y)
    return alpha * m


def build_hero_flames() -> None:
    src = load("hero-flames")
    if not src:
        return
    rgba = black_to_alpha(arr(src), floor=14)
    rgba[..., 3] = edge_fade(rgba[..., 3], left=0.05, right=0.05, top=0.06)
    # Crop the empty black above the tallest flame.
    rows = np.where((rgba[..., 3] > 20).sum(axis=1) > 3)[0]
    top = max(int(rows.min()) - 12, 0) if len(rows) else 0
    img = to_img(rgba[top:], "RGBA")
    big = img.resize((1500, round(1500 * img.height / img.width)), Image.LANCZOS)
    save(big, "decor/hero-flames.webp", 150, quality=66, alpha_quality=62)
    small = img.resize((900, round(900 * img.height / img.width)), Image.LANCZOS)
    save(small, "decor/hero-flames-m.webp", 70, quality=64, alpha_quality=60)


def build_fire_corner() -> None:
    src = load("fire-corner")
    if not src:
        return
    rgba = black_to_alpha(arr(src), floor=14)
    rgba[..., 3] = edge_fade(rgba[..., 3], right=0.35, top=0.25)
    img = to_img(rgba, "RGBA")
    save(img.resize((1400, round(1400 * img.height / img.width)), Image.LANCZOS), "decor/fire-corner.webp", 120, quality=70, alpha_quality=65)
    save(img.resize((760, round(760 * img.height / img.width)), Image.LANCZOS), "decor/fire-corner-m.webp", 50, quality=66, alpha_quality=60)


def build_spark_field() -> None:
    src = load("spark-field")
    if not src:
        return
    rgba = black_to_alpha(arr(src), floor=16, gamma=0.9)
    rgba[..., 3] = edge_fade(rgba[..., 3], top=0.12)
    img = to_img(rgba, "RGBA")
    save(img.resize((1760, round(1760 * img.height / img.width)), Image.LANCZOS), "decor/spark-field.webp", 140, quality=66, alpha_quality=58)


def build_spark_sprite(cell: int = 128) -> None:
    src = load("spark-sprite")
    if not src:
        return
    a = arr(src)
    rgba = black_to_alpha(a, floor=18, gamma=0.85)
    mask = rgba[..., 3] > 40
    # Split into bands along y, then along x inside each band (the sheet is 2 rows x 4 sparks).
    def runs(v: np.ndarray, min_gap: int) -> list[tuple[int, int]]:
        on = np.where(v)[0]
        if not len(on):
            return []
        out, start, prev = [], on[0], on[0]
        for i in on[1:]:
            if i - prev > min_gap:
                out.append((start, prev))
                start = i
            prev = i
        out.append((start, prev))
        return out

    h, w = mask.shape
    boxes = []
    for y0, y1 in runs(mask.sum(axis=1) > 0, int(h * 0.06)):
        for x0, x1 in runs(mask[y0 : y1 + 1].sum(axis=0) > 0, int(w * 0.035)):
            if (x1 - x0) * (y1 - y0) > 60:
                boxes.append((x0, y0, x1, y1))
    print(f"  found {len(boxes)} sparks")
    if not boxes:
        return
    boxes = boxes[:8]
    full = to_img(rgba, "RGBA")
    sheet = Image.new("RGBA", (cell * len(boxes), cell), (0, 0, 0, 0))
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        m = 10
        crop = full.crop((max(x0 - m, 0), max(y0 - m, 0), min(x1 + m, w), min(y1 + m, h)))
        scale = min((cell - 16) / crop.width, (cell - 16) / crop.height)
        crop = crop.resize((max(int(crop.width * scale), 1), max(int(crop.height * scale), 1)), Image.LANCZOS)
        sheet.alpha_composite(crop, (i * cell + (cell - crop.width) // 2, (cell - crop.height) // 2))
    (PUBLIC / "decor").mkdir(parents=True, exist_ok=True)
    save(sheet, "decor/spark-sprite.webp", 40, quality=75, alpha_quality=75)
    (ROOT / "src" / "data").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "data" / "spark-sprite.ts").write_text(
        "// AUTO-GENERATED by scripts/build-decor.py — do not edit by hand.\n"
        f"export const SPARK_FRAMES = {len(boxes)};\n",
        encoding="utf-8",
    )


# ------------------------------------------------------------------ burnt paper
def paper_to_alpha(a: np.ndarray, sample: np.ndarray) -> np.ndarray:
    """Burnt paper on black -> char-coloured burn that fades to transparent where the paper is clean."""
    paper = np.median(sample.reshape(-1, 3), axis=0)
    dist = np.sqrt(((a - paper) ** 2).sum(axis=-1))
    alpha = smoothstep(26, 92, blur(dist, 1.2))
    # Black outside the sheet becomes the site's char colour (screen keeps the ember glow intact).
    rgb = 255 - (255 - a) * (255 - CHAR) / 255
    return np.dstack([rgb, alpha * 255])


def build_scorch_edge() -> None:
    src = load("scorch-edge")
    if not src:
        return
    a = arr(src)
    h, w = a.shape[:2]
    rgba = paper_to_alpha(a, a[int(h * 0.9) :, :])
    alpha = rgba[..., 3] / 255
    # Find the band that holds the tear: first row that is mostly paper marks the bottom.
    row_alpha = alpha.mean(axis=1)
    burnt = np.where(row_alpha > 0.5)[0]
    edge_bottom = int(burnt.max()) if len(burnt) else h // 2
    clean = np.where(row_alpha[edge_bottom:] < 0.03)[0]
    bottom = min(edge_bottom + (int(clean.min()) if len(clean) else int(h * 0.12)) + 6, h)
    # Top: keep a slim band of char above the highest glow.
    glow = (a[..., 0] > 60).sum(axis=1) > w * 0.01
    top_rows = np.where(glow)[0]
    top = max((int(top_rows.min()) if len(top_rows) else edge_bottom - int(h * 0.15)) - int(h * 0.02), 0)
    strip = rgba[top:bottom].copy()
    sh = strip.shape[0]
    # Bottom of the strip must be fully transparent; top fully opaque.
    y = np.linspace(0, 1, sh)[:, None]
    strip[..., 3] *= 1 - smoothstep(0.78, 0.98, y)
    strip[: max(int(sh * 0.04), 2), :, 3] = 255
    # Horizontal wrap cross-fade so it can repeat-x.
    ov = int(w * 0.1)
    t = np.linspace(0, 1, ov)[None, :, None]
    out = strip[:, : w - ov].copy()
    out[:, :ov] = strip[:, w - ov :] * (1 - t) + strip[:, :ov] * t
    img = to_img(out, "RGBA")
    print(f"  strip {img.width}x{img.height} (aspect {img.width / img.height:.1f}:1)")
    PREVIEW.mkdir(parents=True, exist_ok=True)
    prev = Image.new("RGB", (img.width * 2, img.height + 40), (243, 227, 194))
    prev.paste((18, 14, 11), (0, 0, img.width * 2, 6))
    prev.paste(img, (0, 0), img)
    prev.paste(img, (img.width, 0), img)
    prev.save(PREVIEW / "scorch-edge-2x.png")
    save(img, "decor/scorch-edge.webp", 110, quality=80, alpha_quality=80)
    half = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
    save(half, "decor/scorch-edge-m.webp", 45, quality=76, alpha_quality=75)
    (ROOT / "src" / "data" / "scorch-edge.ts").write_text(
        "// AUTO-GENERATED by scripts/build-decor.py — do not edit by hand.\n"
        f"export const SCORCH_EDGE = {{ width: {img.width}, height: {img.height} }};\n",
        encoding="utf-8",
    )


def build_scorch_corner() -> None:
    src = load("scorch-corner")
    if not src:
        return
    a = arr(src)
    h, w = a.shape[:2]
    rgba = paper_to_alpha(a, a[int(h * 0.75) :, int(w * 0.6) :])
    x = np.linspace(0, 1, w)[None, :]
    y = np.linspace(0, 1, h)[:, None]
    # Nothing may survive toward the bottom-right, where the page's own paper takes over.
    rgba[..., 3] *= (1 - smoothstep(0.55, 0.95, x)) * (1 - smoothstep(0.5, 0.95, y)) + 0 * x * y
    img = to_img(rgba, "RGBA")
    save(img.resize((900, round(900 * h / w)), Image.LANCZOS), "decor/scorch-corner.webp", 90, quality=74, alpha_quality=70)


# ---------------------------------------------------------------------- objects
def build_hero_counter() -> None:
    src = load("hero-counter", CUT)
    if not src:
        return
    img = src.convert("RGBA")
    a = np.asarray(img, dtype=np.float32).copy()
    a[..., 3][a[..., 3] < 14] = 0
    ys, xs = np.where(a[..., 3] > 40)
    img = to_img(a, "RGBA").crop((int(xs.min()), int(ys.min()), img.width, int(ys.max()) + 1))
    print(f"  counter {img.width}x{img.height}; touches right edge: {bool((a[..., 3][:, -1] > 200).any())}")
    save(img.resize((1800, round(1800 * img.height / img.width)), Image.LANCZOS), "decor/hero-counter.webp", 180, quality=78, alpha_quality=85)
    save(img.resize((1100, round(1100 * img.height / img.width)), Image.LANCZOS), "decor/hero-counter-m.webp", 90, quality=74, alpha_quality=80)
    (ROOT / "src" / "data" / "hero-counter.ts").write_text(
        "// AUTO-GENERATED by scripts/build-decor.py — do not edit by hand.\n"
        f"export const HERO_COUNTER = {{ width: {img.width}, height: {img.height} }};\n",
        encoding="utf-8",
    )


# ------------------------------------------------------------- maths-only stuff
def build_grain(size: int = 192) -> None:
    rng = np.random.default_rng(7)
    n = rng.normal(0, 1, (size, size)).astype(np.float32)
    # Periodic soften: blur a 3x3 tiling and keep the middle, so the tile wraps perfectly.
    big = np.tile(n, (3, 3))
    n = blur(big, 0.45)[size : size * 2, size : size * 2]
    n = n / n.std()
    light = np.clip(n, 0, None)
    dark = np.clip(-n, 0, None)
    alpha = np.clip((light + dark) * 90, 0, 255)
    alpha = np.round(alpha / 12) * 12  # coarse alpha steps compress far better and look identical
    grey = np.where(n > 0, 255.0, 0.0)
    # A few dust specks.
    for _ in range(int(size * size * 0.0006)):
        x, y = rng.integers(0, size, 2)
        grey[y, x] = 255
        alpha[y, x] = 204
    la = Image.merge("LA", (to_img(grey).convert("L"), to_img(alpha).convert("L")))
    save(la, "textures/grain.png", 40)


def build_brand() -> None:
    logo_path = PUBLIC / "brand" / "seared-vegas-logo.png"
    if not logo_path.exists():
        print("  missing  public/brand/seared-vegas-logo.png")
        return
    logo = Image.open(logo_path).convert("RGBA")
    save(logo.resize((256, 256), Image.LANCZOS), "brand/seared-vegas-logo-256.webp", 30, quality=82, alpha_quality=90)
    save(logo.resize((512, 512), Image.LANCZOS), "brand/seared-vegas-logo-512.webp", 80, quality=84, alpha_quality=90)
    app = ROOT / "src" / "app"
    # Apple touch icon: logo at 86% on solid char.
    tile = Image.new("RGBA", (180, 180), (18, 14, 11, 255))
    s = round(180 * 0.86)
    small = logo.resize((s, s), Image.LANCZOS)
    tile.alpha_composite(small, ((180 - s) // 2, (180 - s) // 2))
    tile.convert("RGB").save(app / "apple-icon.png", optimize=True)
    # favicon.ico from the logo (16/32/48) — replaces the Create Next App default.
    logo.resize((256, 256), Image.LANCZOS).save(app / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("  wrote    src/app/apple-icon.png, src/app/favicon.ico")


# ------------------------------------------------------------------ share image
def build_og() -> None:
    """1200x630 social card composed from the real site layers (no AI, no screenshot)."""
    from PIL import ImageDraw, ImageFont

    fonts = Path("C:/Windows/Fonts")
    candidates = [fonts / "BarlowCondensed-BlackItalic.ttf", ROOT / "assets-src" / "fonts" / "BarlowCondensed-BlackItalic.ttf"]
    font_path = next((f for f in candidates if f.exists()), None)
    need = ["textures/char-tile.webp", "decor/fire-corner.webp", "decor/hero-counter.webp", "decor/hero-flames.webp", "food/hero-tray.webp", "decor/brush/underline-1.webp"]
    if font_path is None or any(not (PUBLIC / n).exists() for n in need):
        print("  skipped  (needs Barlow Condensed Black Italic and the built hero layers)")
        return
    W, H = 1200, 630
    card = Image.new("RGBA", (W, H), (18, 14, 11, 255))
    tile = Image.open(PUBLIC / "textures/char-tile.webp").convert("RGBA").resize((512, 512), Image.LANCZOS)
    for x in range(0, W, 512):
        for y in range(0, H, 512):
            card.paste(tile, (x, y))
    # warm glow behind the tray
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    glow = np.exp(-(((xx - 860) / 420) ** 2 + ((yy - 380) / 300) ** 2))
    g = np.zeros((H, W, 4), dtype=np.float32)
    g[..., 0], g[..., 1], g[..., 2], g[..., 3] = 255, 110, 30, glow * 70
    card.alpha_composite(to_img(g, "RGBA"))

    def layer(rel: str, width: int) -> Image.Image:
        im = Image.open(PUBLIC / rel).convert("RGBA")
        return im.resize((width, round(width * im.height / im.width)), Image.LANCZOS)

    fire = layer("decor/fire-corner.webp", 520)
    card.alpha_composite(fire, (-10, H - fire.height + 10))
    flames = layer("decor/hero-flames.webp", 900)
    card.alpha_composite(flames, (470, H - flames.height - 110))
    counter = layer("decor/hero-counter.webp", 900)
    counter_y = H - counter.height + 120
    card.alpha_composite(counter, (590, counter_y))
    tray = layer("food/hero-tray.webp", 470)
    card.alpha_composite(tray, (712, counter_y - tray.height + 150))
    logo = Image.open(PUBLIC / "brand" / "seared-vegas-logo.png").convert("RGBA").resize((118, 118), Image.LANCZOS)
    card.alpha_composite(logo, (56, 44))

    draw = ImageDraw.Draw(card)
    big = ImageFont.truetype(str(font_path), 108)
    small_path = fonts / "BarlowCondensed-ExtraBold.ttf"
    small = ImageFont.truetype(str(small_path if small_path.exists() else font_path), 30)
    cream, heat, gold = (246, 234, 208, 255), (255, 90, 28, 255), (242, 182, 50, 255)
    x0 = 58
    draw.text((x0 + 2, 196), "LAS VEGAS CAJUN FOOD TRUCK", font=small, fill=gold, spacing=0)
    for dx, dy, col in ((0, 5, (0, 0, 0, 120)), (0, 0, None)):
        y1, y2 = 240 + dy, 336 + dy
        draw.text((x0 + dx, y1), "BIG FLAVOR.", font=big, fill=col or cream)
        draw.text((x0 + dx, y2), "VEGAS ", font=big, fill=col or cream)
        draw.text((x0 + dx + draw.textlength("VEGAS ", font=big), y2), "HEAT.", font=big, fill=col or heat)
    line_w = int(draw.textlength("VEGAS HEAT.", font=big))
    mask = Image.open(PUBLIC / "decor/brush/underline-1.webp").getchannel("A").resize((line_w + 30, 44), Image.LANCZOS)
    stroke = Image.new("RGBA", mask.size, (242, 90, 31, 255))
    stroke.putalpha(mask)
    card.alpha_composite(stroke, (x0 - 12, 452))
    # soft vignette
    v = np.zeros((H, W, 4), dtype=np.float32)
    v[..., 3] = np.clip((np.abs(xx - W / 2) / (W / 2)) ** 3 * 120, 0, 255)
    card.alpha_composite(to_img(v, "RGBA"))

    app = ROOT / "src" / "app"
    out = card.convert("RGB")
    for name in ("opengraph-image.jpg", "twitter-image.jpg"):
        out.save(app / name, quality=84, optimize=True, progressive=True)
    alt = "Seared Vegas: Big Flavor. Vegas Heat. A takeout tray of lobster tail, lamb chops and Cajun penne on a checkered counter."
    for name in ("opengraph-image.alt.txt", "twitter-image.alt.txt"):
        (app / name).write_text(alt + "\n", encoding="utf-8")
    kb = (app / "opengraph-image.jpg").stat().st_size / 1024
    print(f"  wrote    src/app/opengraph-image.jpg + twitter-image.jpg  {W}x{H}  {kb:.0f} KB")
    out.save(PREVIEW / "_og.png")


BUILDERS = {
    "grain": build_grain,
    "brand": build_brand,
    "paper-tile": build_paper_tile,
    "char-tile": build_char_tile,
    "grit-tile": build_grit_tile,
    "paper-stain": build_paper_stain,
    "brush-underline-1": lambda: ink_mask("brush-underline-1", "decor/brush/underline-1.webp", 1200, 30),
    "brush-underline-2": lambda: ink_mask("brush-underline-2", "decor/brush/underline-2.webp", 1200, 30),
    "brush-underline-3": lambda: ink_mask("brush-underline-3", "decor/brush/underline-3.webp", 1200, 30),
    "brush-rule": lambda: ink_mask("brush-rule", "decor/brush/rule.webp", 1600, 30),
    "scorch-edge": build_scorch_edge,
    "scorch-corner": build_scorch_corner,
    "hero-flames": build_hero_flames,
    "fire-corner": build_fire_corner,
    "spark-field": build_spark_field,
    "spark-sprite": build_spark_sprite,
    "hero-counter": build_hero_counter,
    "og": build_og,
}

GROUP_BUDGET_KB = {
    "global (every page)": (320, ["textures/grain.png", "textures/char-tile.webp", "textures/paper-tile.webp", "brand/seared-vegas-logo-256.webp"]),
    "hero first paint, desktop": (450, ["decor/hero-counter.webp", "decor/hero-flames.webp", "decor/fire-corner.webp"]),
    "hero first paint, mobile": (220, ["decor/hero-counter-m.webp", "decor/hero-flames-m.webp", "decor/fire-corner-m.webp"]),
}


def main() -> int:
    names = sys.argv[1:] or list(BUILDERS)
    for n in names:
        if n not in BUILDERS:
            print(f"unknown asset: {n}")
            return 2
        print(n)
        BUILDERS[n]()
    failed = [f"{rel} is {kb:.0f} KB (budget {BUDGET_KB[rel]})" for rel, kb in built if kb > BUDGET_KB[rel]]
    if not sys.argv[1:]:
        for label, (limit, files) in GROUP_BUDGET_KB.items():
            total = sum((PUBLIC / f).stat().st_size for f in files if (PUBLIC / f).exists()) / 1024
            print(f"budget   {label}: {total:.0f} / {limit} KB")
            if total > limit:
                failed.append(f"{label} is {total:.0f} KB (budget {limit})")
    if failed:
        print("\nBUDGET FAILURES\n  " + "\n  ".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
