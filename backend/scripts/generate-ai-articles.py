#!/usr/bin/env python3
"""
AI-Powered Article Generator
Uses Ollama for content generation and Pollinations AI for cover images.

Generates ONE article per run with dynamic date context.
Categories: AI, Web Development, Cloud, DevOps, Mobile, Security,
            Data Structures, Algorithms, System Design, Coding Interview
"""

import os
import sys
import re
import json
import time
import subprocess
import urllib.parse
from datetime import datetime, timedelta

STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:4500")
STRAPI_TOKEN = os.getenv("STRAPI_TOKEN", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4:31b-cloud")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
POLLINATIONS_API_KEY = os.getenv("POLLINATIONS_API_KEY", "sk_x8zsGs3fly2OLixVP9QxaLOuXqd6wuVJ")
TECH_CATEGORIES = ["AI", "Web Development", "Cloud", "DevOps", "Mobile", "Security"]
INTERVIEW_CATEGORIES = ["Data Structures", "Algorithms", "System Design", "Coding Interview"]
ALL_CATEGORIES = TECH_CATEGORIES + INTERVIEW_CATEGORIES
SELECTED_CATEGORY = None
BLOG_SLUG = os.getenv("BLOG_SLUG", "wisdom")


def get_current_date_info():
    """Get current date info for prompts"""
    now = datetime.now()
    months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"]
    month = months[now.month - 1]
    year = now.year
    return month, year


def parse_args():
    global SELECTED_CATEGORY
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--token" and i + 1 < len(args):
            os.environ["STRAPI_TOKEN"] = args[i + 1]
            i += 2
        elif args[i] == "--ollama-url" and i + 1 < len(args):
            os.environ["OLLAMA_URL"] = args[i + 1]
            i += 2
        elif args[i] == "--model" and i + 1 < len(args):
            os.environ["OLLAMA_MODEL"] = args[i + 1]
            i += 2
        elif args[i] == "--category" and i + 1 < len(args):
            SELECTED_CATEGORY = args[i + 1]
            i += 2
        elif args[i] in ["-h", "--help"]:
            print(__doc__)
            sys.exit(0)
        else:
            i += 1


def get_existing_article_titles() -> set:
    """Get titles of existing articles to avoid duplicates"""
    titles = set()
    try:
        result = subprocess.run(
            ["curl", "-s", f"{STRAPI_URL}/api/articles?pagination%5Blimit%5D=100",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}"],
            capture_output=True, text=True, timeout=30
        )
        data = json.loads(result.stdout)
        for article in data.get("data", []):
            titles.add(article.get("title", "").lower())
    except Exception as e:
        print(f"Warning: Could not fetch existing articles: {e}")
    return titles


def get_blog_id() -> int:
    """Get blog ID by slug"""
    try:
        result = subprocess.run(
            ["curl", "-s", f"{STRAPI_URL}/api/blogs?filters%5Bslug%5D%5B%24eq%5D={BLOG_SLUG}",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}"],
            capture_output=True, text=True, timeout=30
        )
        data = json.loads(result.stdout)
        if data.get("data") and len(data["data"]) > 0:
            return data["data"][0]["id"]
    except Exception as e:
        print(f"Warning: Could not fetch blog: {e}")
    return 1


def check_services():
    """Check if Ollama and Strapi are reachable"""
    try:
        result = subprocess.run(
            ["curl", "-s", "--connect-timeout", "5", f"{OLLAMA_URL}/api/tags"],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"Error: Cannot connect to Ollama at {OLLAMA_URL}")
            return False
        print("Ollama is reachable")
    except Exception as e:
        print(f"Error checking Ollama: {e}")
        return False

    try:
        result = subprocess.run(
            ["curl", "-s", "--connect-timeout", "10", "-m", "15",
             "-o", "/dev/null", "-w", "%{http_code}",
             f"{STRAPI_URL}/api/articles?pagination%5Blimit%5D=1",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}"],
            capture_output=True, text=True
        )
        status = result.stdout.strip()
        if status not in ["200", "401"]:
            print(f"Error: Cannot connect to Strapi at {STRAPI_URL} (status: {status})")
            return False
        print("Strapi is reachable")
    except Exception as e:
        print(f"Error checking Strapi: {e}")
        return False

    return True


def ollama_chat(system: str, user: str, max_tokens: int = 2000) -> str:
    """Call Ollama API and return the response content"""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        "stream": False,
        "options": {"temperature": 0.7, "num_predict": max_tokens}
    }

    result = subprocess.run(
        ["curl", "-s", "-X", "POST", f"{OLLAMA_URL}/api/chat",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(payload)],
        capture_output=True, text=True, timeout=120
    )

    try:
        data = json.loads(result.stdout)
        content = data.get("message", {}).get("content", "")
        return content.strip()
    except Exception as e:
        print(f"Error parsing Ollama response: {e}")
        return ""


def get_author_id():
    """Get existing author or create one"""
    try:
        result = subprocess.run(
            ["curl", "-s", f"{STRAPI_URL}/api/authors?pagination%5Blimit%5D=1",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}"],
            capture_output=True, text=True
        )
        data = json.loads(result.stdout)
        if data.get("data") and len(data["data"]) > 0:
            return data["data"][0]["id"]
    except:
        pass

    try:
        result = subprocess.run(
            ["curl", "-s", "-X", "POST", f"{STRAPI_URL}/api/authors",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}",
             "-H", "Content-Type: application/json",
             "-d", '{"data":{"name":"AI Bot","email":"ai@zenkai.blog"}}'],
            capture_output=True, text=True
        )
        data = json.loads(result.stdout)
        return data.get("data", {}).get("id", 1)
    except:
        return 1


def get_category_id(name: str, slug: str, description: str, blog_id: int = None):
    """Get existing category or create one"""
    try:
        filters = f"slug={slug}"
        if blog_id:
            filters += f"&filters[blog][id][$eq]={blog_id}"
        result = subprocess.run(
            ["curl", "-s", f"{STRAPI_URL}/api/categories?filters%5Bslug%5D%5B%24eq%5D={slug}",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}"],
            capture_output=True, text=True
        )
        data = json.loads(result.stdout)
        if data.get("data") and len(data["data"]) > 0:
            return data["data"][0]["id"]
    except:
        pass

    try:
        category_data = {"name": name, "slug": slug, "description": description}
        if blog_id:
            category_data["blog"] = blog_id
        result = subprocess.run(
            ["curl", "-s", "-X", "POST", f"{STRAPI_URL}/api/categories",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}",
             "-H", "Content-Type: application/json",
             "-d", json.dumps({"data": category_data})],
            capture_output=True, text=True
        )
        data = json.loads(result.stdout)
        return data.get("data", {}).get("id", 1)
    except:
        return 1


def search_unsplash(keywords: list) -> str:
    """Search Unsplash for relevant image"""
    if UNSPLASH_ACCESS_KEY:
        query = ",".join(keywords[:3]).replace(" ", "+")
        try:
            result = subprocess.run(
                ["curl", "-s", f"https://api.unsplash.com/search/photos?query={query}&per_page=5",
                 "-H", f"Authorization: Client-ID {UNSPLASH_ACCESS_KEY}"],
                capture_output=True, text=True, timeout=10
            )
            data = json.loads(result.stdout)
            if data.get("results"):
                return data["results"][0]["urls"]["regular"]
        except Exception as e:
            print(f"Unsplash error: {e}")

    return generate_with_pollinations(keywords)


def generate_with_pollinations(keywords: list) -> str:
    """Generate image using Pollinations AI"""
    prompt = f"Professional tech blog cover image for article about {', '.join(keywords)}. Modern, clean, abstract technology, no text, high quality"

    try:
        encoded_prompt = urllib.parse.quote(prompt, safe='')
        url = f"https://image.pollinations.ai/{encoded_prompt}?width=1200&height=630&seed=42&nologo=true"
        return url
    except Exception as e:
        print(f"Pollinations error: {e}")

    return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"


def upload_image(image_url: str, retries: int = 3) -> int:
    """Upload image from URL or base64 data to Strapi"""
    try:
        if image_url.startswith("data:"):
            import base64
            mime_type = image_url.split(";")[0].replace("data:", "")
            ext = "png" if "png" in mime_type else "jpg"
            base64_data = image_url.split(",")[1]

            result = subprocess.run(
                ["curl", "-s", "-X", "POST", f"{STRAPI_URL}/api/upload",
                 "-H", f"Authorization: Bearer {STRAPI_TOKEN}",
                 "-F", f"files=@/dev/stdin;filename=cover.{ext};type={mime_type}"],
                input=base64.b64decode(base64_data), capture_output=True, timeout=60
            )
        else:
            for attempt in range(retries):
                result = subprocess.run(
                    ["curl", "-s", "-L", "--max-time", "60", image_url, "-o", "/tmp/cover_image.jpg"],
                    capture_output=True, timeout=65
                )

                try:
                    with open("/tmp/cover_image.jpg", "rb") as f:
                        header = f.read(100)
                        content = header.decode('utf-8', errors='ignore')
                        if b"{" in header and ("error" in content.lower() or "queue" in content.lower()):
                            print(f"Image API rate limited (attempt {attempt+1}/{retries}), waiting...")
                            time.sleep(10 * (attempt + 1))
                            continue
                        if header.startswith(b"\xff\xd8\xff") or header.startswith(b"\x89PNG"):
                            break
                    print(f"Invalid image (attempt {attempt+1}/{retries}), retrying...")
                    time.sleep(5)
                    continue
                except Exception as e:
                    print(f"Image check error: {e}, retrying...")
                    continue

            result = subprocess.run(
                ["curl", "-s", "-X", "POST", f"{STRAPI_URL}/api/upload",
                 "-H", f"Authorization: Bearer {STRAPI_TOKEN}",
                 "-F", "files=@/tmp/cover_image.jpg;filename=cover.jpg;type=image/jpeg"],
                capture_output=True, text=True, timeout=30
            )

        data = json.loads(result.stdout)
        if isinstance(data, list) and len(data) > 0:
            return data[0]["id"]
        elif data.get("data"):
            return data["data"][0]["id"]
    except Exception as e:
        print(f"Image upload error: {e}")

    return None


def create_article(title: str, slug: str, description: str, content: str,
                    category_id: int, author_id: int, image_id: int = None, blog_id: int = None):
    """Create article in Strapi"""
    data = {
        "data": {
            "title": title,
            "slug": slug,
            "description": description,
            "authorsBio": author_id,
            "category": category_id,
            "blocks": [
                {
                    "__component": "shared.rich-text",
                    "body": content
                }
            ],
            "publishedAt": datetime.utcnow().isoformat() + "Z"
        }
    }

    if image_id:
        data["data"]["cover"] = image_id
    
    if blog_id:
        data["data"]["blog"] = blog_id

    try:
        result = subprocess.run(
            ["curl", "-s", "-X", "POST", f"{STRAPI_URL}/api/articles",
             "-H", f"Authorization: Bearer {STRAPI_TOKEN}",
             "-H", "Content-Type: application/json",
             "-d", json.dumps(data)],
            capture_output=True, text=True, timeout=30
        )

        response_data = json.loads(result.stdout)
        if response_data.get("data"):
            return response_data["data"]["id"]
    except Exception as e:
        print(f"Article creation error: {e}")

    return None


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def generate_topic(category: str, existing_titles: set) -> dict:
    """Generate a topic using Ollama"""
    print(f"Generating topic for: {category}")

    month, year = get_current_date_info()
    excluded = ", ".join([f'"{t}"' for t in list(existing_titles)[:5]]) if existing_titles else "none"

    system = """You are a tech blogger assistant. Return ONLY valid JSON array with 1 topic object.
Each topic must have: title (max 60 chars), slug (url-friendly), description (max 200 chars), keywords (array of 3 strings).
IMPORTANT: Choose a DIFFERENT topic than these existing articles: """ + excluded + """
Return ONLY valid JSON array, no markdown, no explanation."""

    user = f"""Find a TRENDING topic in {category} for {month} {year} that is DIFFERENT from: {list(existing_titles) if existing_titles else 'none'}.
The topic should be about LATEST developments in {month} {year}, NOT covered in existing articles.
Return JSON array with 1 topic."""

    content = ollama_chat(system, user, 500)

    if not content:
        return {}

    try:
        topics = json.loads(content)
        if isinstance(topics, list) and len(topics) > 0:
            topic = topics[0]
            return {
                "title": topic.get("title", topic.get("topic", "")),
                "slug": topic.get("slug", slugify(topic.get("title", topic.get("topic", "")))),
                "description": topic.get("description", ""),
                "keywords": topic.get("keywords", [category])
            }
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Content: {content[:200]}")

    return {}


def generate_content(title: str, description: str, category: str) -> str:
    """Generate article content using Ollama"""
    print("Generating article content...")

    month, year = get_current_date_info()

    system = """You are a tech blogger. Write engaging HTML content for a blog post.
Use <p>, <h2>, <ul>, <li>, <code>, <blockquote> tags where appropriate.
Target 800-1200 words. First paragraph must hook readers.
IMPORTANT:
- Do NOT use LaTeX notation. Use HTML arrows (&rarr;, &larr;) instead.
- Code blocks: Use triple backticks ```python then code then ``` on separate lines.
- CRITICAL: Code blocks must ONLY contain pure executable code. NO comments, explanations, or text inside code fences.
- Keep code indentation intact with 4 spaces.
- Always reference the current date context in content where relevant.
Return ONLY HTML content (except code fences), no markdown headings."""

    user = f"""Write a comprehensive blog article about: {title}

Description: {description}
Category: {category}
Date Context: {month} {year}

Include:
- An engaging introduction (mention {month} {year} context where relevant)
- 3-4 key points or sections
- Code examples or practical tips
- A conclusion with call-to-action"""

    content = ollama_chat(system, user, 2000)
    content = content.strip() if content else f"<p>{description}</p>"

    # Convert literal \n to actual newlines
    content = content.replace('\\n', '\n')

    # Unescape escaped backticks from API responses
    content = content.replace('\\`\\`\\`', '```')

    # Convert LaTeX math notation to HTML entities
    content = re.sub(r"\$\\?rightarrow\$", "&rarr;", content)
    content = re.sub(r"\$\\?leftarrow\$", "&larr;", content)
    content = re.sub(r"\$\\?Rightarrow\$", "&rArr;", content)
    content = re.sub(r"\$\\?Leftarrow\$", "&lArr;", content)
    content = re.sub(r"\$([^$]+)\$", r"<code>\1</code>", content)

    # Format code blocks: ONLY handle triple-backtick fences
    lines = content.split('\n')
    formatted_lines = []
    in_code_block = False
    code_buffer = []

    for line in lines:
        stripped = line.strip()

        # Handle triple-backtick code fences only (```, ```python, etc.)
        if '```' in line or '~~~' in line:
            if in_code_block:
                # Clean code buffer: remove lines that are just explanatory text
                cleaned_code = []
                for code_line in code_buffer:
                    stripped = code_line.strip()
                    # Skip lines that are pure text without code patterns
                    if stripped and not stripped.startswith('# Example'):
                        cleaned_code.append(code_line)

                formatted_lines.append('\n'.join(cleaned_code).replace('<', '&lt;').replace('>', '&gt;'))
                formatted_lines.append('</code></pre>')
                code_buffer = []
                in_code_block = False
            else:
                # Start code block
                if formatted_lines and not formatted_lines[-1].endswith('</pre>'):
                    formatted_lines.append('</p>')
                formatted_lines.append('<pre><code>')
                in_code_block = True
            continue

        if in_code_block:
            code_buffer.append(line)
        else:
            formatted_lines.append(line)

    if in_code_block and code_buffer:
        cleaned_code = []
        for code_line in code_buffer:
            stripped = code_line.strip()
            if stripped and not stripped.startswith('# Example'):
                cleaned_code.append(code_line)
        formatted_lines.append('\n'.join(cleaned_code).replace('<', '&lt;').replace('>', '&gt;'))
        formatted_lines.append('</code></pre>')

    content = '\n'.join(formatted_lines)

    # Preserve all newlines - HTML <pre> tags handle code block formatting correctly
    # and paragraphs don't need newlines in HTML

    return content if content else f"<p>{description}</p>"


def process_category(category: str, existing_titles: set):
    """Process a single category and create an article"""
    print(f"\n{'='*50}")
    print(f"  Processing: {category}")
    print(f"{'='*50}")

    blog_id = get_blog_id()
    category_slug = slugify(category)
    category_id = get_category_id(category, category_slug, f"Latest {category} news", blog_id)
    author_id = get_author_id()

    topic = generate_topic(category, existing_titles)
    if not topic:
        print("Failed to generate topic")
        return

    print(f"\nTopic: {topic['title']}")
    print(f"Slug: {topic['slug']}")
    print(f"Description: {topic['description']}")
    print(f"Keywords: {topic['keywords']}")

    content = generate_content(topic["title"], topic["description"], category)
    if not content:
        print("Failed to generate content")
        return

    print(f"Content length: {len(content)} chars")

    print("\nSearching for cover image...")
    image_url = search_unsplash(topic.get("keywords", [category]))
    print(f"Cover image: {image_url[:60]}...")

    print("Uploading image to Strapi...")
    image_id = upload_image(image_url)
    if image_id:
        print(f"Image uploaded with ID: {image_id}")
    else:
        print("Warning: Image upload failed, article will be created without cover image")

    slug = f"{topic['slug']}-{int(time.time())}"

    print("\nCreating article...")
    article_id = create_article(
        topic["title"], slug, topic["description"], content,
        category_id, author_id, image_id, blog_id
    )

    if article_id:
        print(f"\n✅ SUCCESS! Article created with ID: {article_id}")
    else:
        print("\n❌ FAILED to create article")


def main():
    global STRAPI_TOKEN

    parse_args()

    month, year = get_current_date_info()

    print("=" * 50)
    print("  AI-Powered Article Generator")
    print(f"  Date Context: {month} {year}")
    print("=" * 50)
    print()
    print(f"Ollama: {OLLAMA_URL} ({OLLAMA_MODEL})")
    print(f"Strapi: {STRAPI_URL}")
    print()

    if not STRAPI_TOKEN:
        print("Error: STRAPI_TOKEN is required")
        print("Set STRAPI_TOKEN environment variable or use --token flag")
        sys.exit(1)

    if not check_services():
        sys.exit(1)

    print("\nFetching existing articles to avoid duplicates...")
    existing_titles = get_existing_article_titles()
    print(f"Found {len(existing_titles)} existing articles")

    if SELECTED_CATEGORY:
        categories = [SELECTED_CATEGORY]
    else:
        import random
        categories = random.sample(ALL_CATEGORIES, 1)
        print(f"\nSelected category: {categories[0]}")
        print("(Use --category flag to specify a category)")

    for category in categories:
        process_category(category, existing_titles)

    print(f"\n{'='*50}")
    print("  Done!")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
