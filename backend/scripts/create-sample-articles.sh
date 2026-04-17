#!/bin/bash

STRAPI_URL="${STRAPI_URL:-http://localhost:4500}"
API_TOKEN="${STRAPI_TOKEN:-5109a1c1fbab609173bd8c029f6a54d3f9403a8fcc54aaaac8b825cf32cb73ad5d50714aac23c39cbd88674615ec1972a752929ca8a11f3f5bd14cd2ef03e3a989ffaeaf029e8ec0c95bd16e0b3088aeef6885317a781466e3422762d01bc6324577972457df28738494f999c381060ffdcbd56368ee470954d74346a0efe240}"

usage() {
  echo "Usage: $0 [--token <api-token>]"
  echo ""
  echo "Options:"
  echo "  --token <api-token>  Strapi API token (or set STRAPI_TOKEN env var)"
  echo ""
  echo "Environment variables:"
  echo "  STRAPI_URL     Strapi server URL (default: http://localhost:4500)"
  echo "  STRAPI_TOKEN   Strapi API token (default: none)"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --token)
      API_TOKEN="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

if [ -z "$API_TOKEN" ]; then
  echo "Error: API token required. Use --token or set STRAPI_TOKEN env var"
  exit 1
fi

check_strapi() {
  echo "Checking Strapi server at $STRAPI_URL..."
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STRAPI_URL/api/articles?pagination%5Blimit%5D=1" \
    -H "Authorization: Bearer $API_TOKEN" 2>/dev/null)
  if [ "$STATUS" != "200" ] && [ "$STATUS" != "401" ]; then
    echo "Error: Cannot connect to Strapi server at $STRAPI_URL"
    exit 1
  fi
  echo "Strapi server is reachable"
}

check_author() {
  RESPONSE=$(curl -s "$STRAPI_URL/api/authors?pagination%5Blimit%5D=1" \
    -H "Authorization: Bearer $API_TOKEN")
  AUTHOR_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  if [ -n "$AUTHOR_ID" ]; then
    echo "Found existing author with ID: $AUTHOR_ID" >&2
  else
    echo "Creating author..." >&2
    RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/authors" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"data":{"name":"Jane Smith","email":"jane@zenkai.blog"}}')
    AUTHOR_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "Author created with ID: $AUTHOR_ID" >&2
  fi
  echo "$AUTHOR_ID"
}

get_or_create_category() {
  local name="$1"
  local slug="$2"
  local desc="$3"

  echo "Checking category: $name..." >&2
  RESPONSE=$(curl -s "$STRAPI_URL/api/categories?filters%5Bslug%5D%5B%24eq%5D=$slug" \
    -H "Authorization: Bearer $API_TOKEN")
  CATEGORY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  
  if [ -n "$CATEGORY_ID" ]; then
    echo "Found category '$name' with ID: $CATEGORY_ID" >&2
  else
    echo "Creating category: $name..." >&2
    RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/categories" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"data\":{\"name\":\"$name\",\"slug\":\"$slug\",\"description\":\"$desc\"}}")
    CATEGORY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "Category '$name' created with ID: $CATEGORY_ID" >&2
  fi
  echo "$CATEGORY_ID"
}

create_article() {
  local title="$1"
  local slug="$2"
  local desc="$3"
  local category_id="$4"
  local author_id="$5"
  local body="$6"

  echo "Creating article: $title..."
  
  JSON=$(cat <<EOF
{
  "data": {
    "title": "$title",
    "slug": "$slug",
    "description": "$desc",
    "category": $category_id,
    "authorsBio": $author_id,
    "blocks": [
      {
        "__component": "shared.rich-text",
        "body": "$body"
      }
    ],
    "publishedAt": null
  }
}
EOF
)

  RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/articles" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON")
  
  if echo "$RESPONSE" | grep -q '"data"'; then
    echo "Article '$title' created!"
  else
    echo "Failed to create '$title': $RESPONSE"
  fi
}

main() {
  echo "=========================================="
  echo "  Strapi Sample Articles Seeder"
  echo "=========================================="
  echo ""

  check_strapi

  AUTHOR_ID=$(check_author)
  CATEGORY_TECH=$(get_or_create_category "Technology" "technology" "Latest tech news and tutorials")
  CATEGORY_LIFESTYLE=$(get_or_create_category "Lifestyle" "lifestyle" "Tips for modern living")
  CATEGORY_TRAVEL=$(get_or_create_category "Travel" "travel" "Adventure and exploration stories")

  echo ""
  echo "Creating sample articles..."

  create_article \
    "Getting Started with Next.js 15" \
    "getting-started-nextjs-15" \
    "A comprehensive guide to building modern web apps with Next.js 15" \
    "$CATEGORY_TECH" \
    "$AUTHOR_ID" \
    "<p>Next.js 15 introduces exciting new features including improved server actions, enhanced caching, and better developer experience. This guide covers everything you need to know to get started.</p><p>With the App Router now stable, building complex applications has never been easier.</p>"

  create_article \
    "The Future of AI in Web Development" \
    "future-ai-web-development" \
    "How artificial intelligence is transforming the way we build websites" \
    "$CATEGORY_TECH" \
    "$AUTHOR_ID" \
    "<p>AI is revolutionizing web development from code completion to automated testing. Learn how to leverage these tools to boost your productivity.</p>"

  echo ""
  echo "=========================================="
  echo "  Done! Created 5 sample articles."
  echo "=========================================="
}

main
