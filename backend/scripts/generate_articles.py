#!/usr/bin/env python3
"""
AI-Powered Article Generator
Uses Ollama for content generation and Unsplash for cover images
"""

import os
import json
import re
import requests
from datetime import datetime
from openai import OpenAI

STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:4500")
STRAPI_TOKEN = os.getenv("STRAPI_TOKEN", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:4b")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
TECH_CATEGORIES = ["AI", "Web Development", "Cloud", "DevOps", "Mobile", "Security"]


def setup_ollama():
    client = OpenAI(base_url=f"{OLLAMA_URL}/v1", api_key="ollama")
    return client


def setup_strapi():
    return {
        "Authorization": f"Bearer {STRAPI_TOKEN}",
        "Content-Type": "application/json"
    }


def search_trends_with_ollama(client, category):
    """Use Ollama to find latest tech trends"""
    prompt = f"""Search for the latest technology trends and news in {category} as of April 2026.
Return a JSON array with 1-2 trending topics. Each topic should have:
- title: catchy article title (max 60 chars)
- slug: url-friendly slug
- description: brief summary (max 200 chars)
- keywords: array of 3-5 search keywords for finding images

Return ONLY valid JSON, no markdown formatting.
Example format:
[{{"title": "Title here", "slug": "title-here", "description": "Summary", "keywords": ["keyword1", "keyword2"]}}]"""

    try:
        response = client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )
        content = response.choices[0].message.content.strip()
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        content = re.sub(r'`+$', '', content)
        topics = json.loads(content)
        return topics
    except Exception as e:
        print(f"Error searching trends: {e}")
        return []


def generate_article_content(client, topic):
    """Use Ollama to generate full article content"""
    prompt = f"""Write a comprehensive tech blog article about: {topic['title']}

Topic: {topic['description']}

Generate HTML content for the article body. Include:
- An engaging introduction (2-3 paragraphs)
- Key points and explanations
- Code examples or practical tips where relevant
- A conclusion

Format the output as HTML with proper tags like <p>, <h2>, <ul>, <li>, <code>, etc.
Return ONLY the HTML content, no markdown.
Keep the content around 800-1200 words.
The first paragraph should be especially engaging to hook readers."""

    try:
        response = client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000
        )
        content = response.choices[0].message.content.strip()
        content = re.sub(r'```html\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        content = re.sub(r'`+$', '', content)
        return content
    except Exception as e:
        print(f"Error generating content: {e}")
        return f"<p>{topic['description']}</p>"


def search_unsplash_image(keywords):
    """Search Unsplash for relevant image"""
    if not UNSPLASH_ACCESS_KEY:
        print("No Unsplash API key, using fallback image")
        return get_fallback_image()

    query = ",".join(keywords[:3])
    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": query,
        "per_page": 5,
        "orientation": "landscape"
    }
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                photo = data["results"][0]
                return {
                    "url": photo["urls"]["regular"],
                    "thumb": photo["urls"]["thumb"],
                    "credit": f"{photo['user']['name']} on Unsplash",
                    "credit_url": photo["user"]["links"]["html"]
                }
    except Exception as e:
        print(f"Unsplash search error: {e}")

    return get_fallback_image()


def get_fallback_image():
    """Generate a tech-themed placeholder"""
    return {
        "url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
        "thumb": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200",
        "credit": "Technology image",
        "credit_url": "https://unsplash.com"
    }


def get_author_id(headers):
    """Get existing author or create one"""
    try:
        resp = requests.get(
            f"{STRAPI_URL}/api/authors?pagination%5Blimit%5D=1",
            headers=headers,
            timeout=10
        )
        data = resp.json()
        if data.get("data") and len(data["data"]) > 0:
            return data["data"][0]["id"]
    except:
        pass

    resp = requests.post(
        f"{STRAPI_URL}/api/authors",
        headers=headers,
        json={"data": {"name": "AI Bot", "email": "ai@zenkai.blog"}},
        timeout=10
    )
    return resp.json().get("data", {}).get("id", 1)


def get_category_id(headers, name, slug, description):
    """Get existing category or create one"""
    try:
        resp = requests.get(
            f"{STRAPI_URL}/api/categories?filters%5Bslug%5D%5B%24eq%5D={slug}",
            headers=headers,
            timeout=10
        )
        data = resp.json()
        if data.get("data") and len(data["data"]) > 0:
            return data["data"][0]["id"]
    except:
        pass

    resp = requests.post(
        f"{STRAPI_URL}/api/categories",
        headers=headers,
        json={"data": {"name": name, "slug": slug, "description": description}},
        timeout=10
    )
    return resp.json().get("data", {}).get("id", 1)


def upload_image_to_strapi(headers, image_url):
    """Upload image from URL to Strapi media library"""
    try:
        resp = requests.get(image_url, timeout=30)
        if resp.status_code != 200:
            return None

        files = {
            "file": ("cover.jpg", resp.content, "image/jpeg")
        }
        upload_resp = requests.post(
            f"{STRAPI_URL}/api/upload",
            headers={k: v for k, v in headers.items() if k != "Content-Type"},
            files=files,
            timeout=30
        )

        if upload_resp.status_code in [200, 201]:
            data = upload_resp.json()
            if data.get("data"):
                return data["data"][0]["id"]
    except Exception as e:
        print(f"Image upload error: {e}")

    return None


def create_article(headers, author_id, category_id, topic, content, image_id=None):
    """Create article in Strapi"""
    data = {
        "data": {
            "title": topic["title"],
            "slug": topic["slug"],
            "description": topic["description"],
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

    try:
        resp = requests.post(
            f"{STRAPI_URL}/api/articles",
            headers=headers,
            json=data,
            timeout=30
        )

        if resp.status_code in [200, 201]:
            return True, resp.json()

        print(f"Article creation failed: {resp.text}")
        return False, None
    except Exception as e:
        print(f"Error creating article: {e}")
        return False, None


def main():
    print("=" * 50)
    print("  AI-Powered Article Generator")
    print("=" * 50)
    print()

    if not STRAPI_TOKEN:
        print("Error: STRAPI_TOKEN environment variable is required")
        return

    headers = setup_strapi()
    client = setup_ollama()

    print(f"Using Ollama model: {OLLAMA_MODEL}")
    print(f"Targeting Strapi at: {STRAPI_URL}")
    print()

    for category in TECH_CATEGORIES:
        print(f"\n--- Processing category: {category} ---")

        topics = search_trends_with_ollama(client, category)
        if not topics:
            print(f"No trends found for {category}")
            continue

        for topic in topics:
            print(f"\nGenerating article: {topic['title']}")

            content = generate_article_content(client, topic)
            print(f"  Content generated ({len(content)} chars)")

            image = search_unsplash_image(topic.get("keywords", [category]))
            print(f"  Image found: {image['thumb'][:50]}...")

            category_id = get_category_id(
                headers,
                category,
                category.lower().replace(" ", "-"),
                f"Latest {category} news and tutorials"
            )

            author_id = get_author_id(headers)

            image_id = None
            if UNSPLASH_ACCESS_KEY:
                print("  Uploading image to Strapi...")
                image_id = upload_image_to_strapi(headers, image["url"])

            success, result = create_article(
                headers, author_id, category_id, topic, content, image_id
            )

            if success:
                article_id = result.get("data", {}).get("id", "unknown")
                print(f"  ✅ Article created successfully! (ID: {article_id})")
            else:
                print(f"  ❌ Failed to create article")

            print()


def add_argument_parser(subparsers):
    """Add CLI arguments for standalone use"""
    parser = subparsers.add_parser("generate", help="Generate AI articles")
    parser.add_argument("--category", "-c", help="Specific category to process")
    parser.add_argument("--limit", "-l", type=int, default=1, help="Articles per category")


if __name__ == "__main__":
    main()
