#!/bin/bash
#
# AI-Powered Article Generator
# Uses Ollama for content generation and Unsplash for cover images
#

STRAPI_URL="${STRAPI_URL:-http://localhost:4500}"
STRAPI_TOKEN="${STRAPI_TOKEN:-}"
OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:4b}"
UNSPLASH_ACCESS_KEY="${UNSPLASH_ACCESS_KEY:-}"

TECH_CATEGORIES="AI|Web Development|Cloud|DevOps|Mobile|Security"

print_usage() {
    echo "Usage: $0 [--token <strapi-token>] [--ollama-url <url>] [--model <model>] [--category <name>] [--help]"
    echo ""
    echo "Options:"
    echo "  --token <strapi-token>     Strapi API token (or set STRAPI_TOKEN env)"
    echo "  --ollama-url <url>         Ollama URL (default: http://localhost:11434)"
    echo "  --model <model>            Ollama model (default: qwen3:4b)"
    echo "  --category <name>          Specific category to process"
    echo "  --help                     Show this help"
    echo ""
    echo "Environment variables:"
    echo "  STRAPI_URL, STRAPI_TOKEN, OLLAMA_URL, OLLAMA_MODEL, UNSPLASH_ACCESS_KEY"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --token) STRAPI_TOKEN="$2"; shift 2 ;;
        --ollama-url) OLLAMA_URL="$2"; shift 2 ;;
        --model) OLLAMA_MODEL="$2"; shift 2 ;;
        --category) SELECTED_CATEGORY="$2"; shift 2 ;;
        -h|--help) print_usage; exit 0 ;;
        *) echo "Unknown option: $1"; print_usage; exit 1 ;;
    esac
done

if [ -z "$STRAPI_TOKEN" ]; then
    echo "Error: STRAPI_TOKEN is required"
    exit 1
fi

check_ollama() {
    echo "Checking Ollama at $OLLAMA_URL..."
    if ! curl -s --connect-timeout 5 "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
        echo "Error: Cannot connect to Ollama at $OLLAMA_URL"
        exit 1
    fi
    echo "Ollama is reachable"
}

check_strapi() {
    echo "Checking Strapi at $STRAPI_URL..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STRAPI_URL/api/articles?pagination%5Blimit%5D=1" \
        -H "Authorization: Bearer $STRAPI_TOKEN" 2>/dev/null)
    if [ "$STATUS" != "200" ] && [ "$STATUS" != "401" ]; then
        echo "Error: Cannot connect to Strapi at $STRAPI_URL"
        exit 1
    fi
    echo "Strapi is reachable"
}

ollama_chat() {
    local system="$1"
    local user="$2"
    local max_tokens="${3:-2000}"

    curl -s -X POST "$OLLAMA_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$OLLAMA_MODEL\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"$system\"},
                {\"role\": \"user\", \"content\": \"$user\"}
            ],
            \"stream\": false,
            \"options\": {\"temperature\": 0.7, \"num_predict\": $max_tokens}
        }" 2>/dev/null
}

get_author_id() {
    RESPONSE=$(curl -s "$STRAPI_URL/api/authors?pagination%5Blimit%5D=1" \
        -H "Authorization: Bearer $STRAPI_TOKEN")
    AUTHOR_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    if [ -n "$AUTHOR_ID" ]; then
        echo "$AUTHOR_ID"
        return
    fi

    RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/authors" \
        -H "Authorization: Bearer $STRAPI_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"data":{"name":"AI Bot","email":"ai@zenkai.blog"}}')
    echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2
}

get_category_id() {
    local name="$1"
    local slug="$2"
    local desc="$3"

    RESPONSE=$(curl -s "$STRAPI_URL/api/categories?filters%5Bslug%5D%5B%24eq%5D=$slug" \
        -H "Authorization: Bearer $STRAPI_TOKEN")
    CATEGORY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

    if [ -n "$CATEGORY_ID" ]; then
        echo "$CATEGORY_ID"
        return
    fi

    RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/categories" \
        -H "Authorization: Bearer $STRAPI_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"data\":{\"name\":\"$name\",\"slug\":\"$slug\",\"description\":\"$desc\"}}")
    echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2
}

search_unsplash() {
    local keywords="$1"
    local query=$(echo "$keywords" | cut -d',' -f1-3 | tr ',' ' ')

    if [ -z "$UNSPLASH_ACCESS_KEY" ]; then
        echo "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"
        return
    fi

    RESPONSE=$(curl -s "https://api.unsplash.com/search/photos?query=$query&per_page=5" \
        -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY")

    IMAGE_URL=$(echo "$RESPONSE" | grep -o '"regular":"[^"]*"' | head -1 | sed 's/"regular":"//;s/"$//' | sed 's/\\//g')
    if [ -n "$IMAGE_URL" ]; then
        echo "$IMAGE_URL"
    else
        echo "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"
    fi
}

upload_image() {
    local image_url="$1"

    echo "  Downloading image..."
    IMAGE_DATA=$(curl -s -L "$image_url" 2>/dev/null)
    if [ -z "$IMAGE_DATA" ]; then
        echo "  Failed to download image"
        return
    fi

    echo "  Uploading to Strapi..."
    RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/upload" \
        -H "Authorization: Bearer $STRAPI_TOKEN" \
        -F "file=@/dev/stdin;filename=cover.jpg;type=image/jpeg" \
        <<< "$IMAGE_DATA" 2>/dev/null)

    IMAGE_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "$IMAGE_ID"
}

create_article() {
    local title="$1"
    local slug="$2"
    local desc="$3"
    local content="$4"
    local category_id="$5"
    local author_id="$6"
    local image_id="$7"

    local json_data="{
        \"data\": {
            \"title\": $(echo "$title" | jq -Rs .),
            \"slug\": $(echo "$slug" | jq -Rs .),
            \"description\": $(echo "$desc" | jq -Rs .),
            \"authorsBio\": $author_id,
            \"category\": $category_id,
            \"blocks\": [
                {
                    \"__component\": \"shared.rich-text\",
                    \"body\": $(echo "$content" | jq -Rs .)
                }
            ],
            \"publishedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
        }
    }"

    if [ -n "$image_id" ]; then
        json_data=$(echo "$json_data" | jq --argjson img "$image_id" '.data.cover = $img')
    fi

    RESPONSE=$(curl -s -X POST "$STRAPI_URL/api/articles" \
        -H "Authorization: Bearer $STRAPI_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_data")

    if echo "$RESPONSE" | grep -q '"data"'; then
        ARTICLE_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        echo "$ARTICLE_ID"
        return 0
    fi
    return 1
}

generate_topic() {
    local category="$1"

    echo "Generating topic for: $category" >&2

    local system="You are a tech blogger assistant. Return ONLY valid JSON array with 1 topic object. Each topic must have: title (max 60 chars), slug (url-friendly), description (max 200 chars), keywords (array of 3 strings). Return ONLY valid JSON array, no markdown."
    local user="Find the latest trending topic in $category as of April 2026. Return JSON: [{\"title\":\"...\",\"slug\":\"...\",\"description\":\"...\",\"keywords\":[\"...\",\"...\",\"...\"]}]"

    local response=$(ollama_chat "$system" "$user" 500)

    local content=$(echo "$response" | python3 -c "
import sys, json, re
data = json.load(sys.stdin)
content = data.get('message', {}).get('content', '')
content = re.sub(r'\`\`\`json\s*', '', content)
content = re.sub(r'\`\`\`\s*', '', content)
content = re.sub(r'\`+$', '', content)
print(content)
" 2>/dev/null)

    echo "$content"
}

generate_content() {
    local title="$1"
    local desc="$2"

    echo "Generating article content..." >&2

    local system="You are a tech blogger. Write engaging HTML content. Use <p>, <h2>, <ul>, <li>, <code> tags. 800-1200 words. First paragraph must hook readers. Return ONLY HTML, no markdown."
    local user="Write a blog article about: $title\n\nDescription: $desc\n\nInclude introduction, key points, examples, and conclusion."

    local response=$(ollama_chat "$system" "$user" 2000)

    echo "$response" | python3 -c "
import sys, json, re
data = json.load(sys.stdin)
content = data.get('message', {}).get('content', '')
content = re.sub(r'\`\`\`html\s*', '', content)
content = re.sub(r'\`\`\`\s*', '', content)
content = re.sub(r'\`+$', '', content)
content = re.sub(r'\n', ' ', content)
print(content)
" 2>/dev/null
}

slugify() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g' | sed 's/-+/-/g' | sed 's/^-//;s/-$//'
}

process_category() {
    local category="$1"
    echo ""
    echo "=========================================="
    echo "  Processing: $category"
    echo "=========================================="

    local category_slug=$(slugify "$category")
    local category_id=$(get_category_id "$category" "$category_slug" "Latest $category news")
    local author_id=$(get_author_id)

    local topic_json=$(generate_topic "$category")
    if [ -z "$topic_json" ]; then
        echo "Failed to generate topic"
        return
    fi

    echo "Raw topic JSON: ${topic_json:0:200}..." >&2

    local title=$(echo "$topic_json" | jq -r 'if type == "array" then .[0].title else .title end // empty' 2>/dev/null)
    local slug=$(echo "$topic_json" | jq -r 'if type == "array" then .[0].slug else .slug end // empty' 2>/dev/null)
    local description=$(echo "$topic_json" | jq -r 'if type == "array" then .[0].description else .description end // empty' 2>/dev/null)
    local keywords=$(echo "$topic_json" | jq -r 'if type == "array" then .[0].keywords[] elif type == "object" then .keywords[] else empty end // empty' 2>/dev/null | tr '\n' ',')

    if [ -z "$title" ]; then
        echo "Failed to parse topic"
        return
    fi

    if [ -z "$slug" ]; then
        slug=$(slugify "$title")
    fi

    slug="${slug}-$(date +%s)"

    echo ""
    echo "Topic: $title"
    echo "Slug: $slug"
    echo "Description: $description"
    echo "Keywords: $keywords"

    local content=$(generate_content "$title" "$description")
    content=$(echo "$content" | tr -d '\n')
    if [ -z "$content" ]; then
        echo "Failed to generate content"
        return
    fi
    echo "Content length: ${#content} chars" >&2

    local image_url=$(search_unsplash "$keywords")
    echo ""
    echo "Cover image: $image_url"

    local image_id=""
    if [ -n "$UNSPLASH_ACCESS_KEY" ] && [[ "$image_url" == *"unsplash"* ]]; then
        image_id=$(upload_image "$image_url")
    fi

    echo ""
    echo "Creating article..."
    if article_id=$(create_article "$title" "$slug" "$description" "$content" "$category_id" "$author_id" "$image_id"); then
        echo ""
        echo "✅ SUCCESS! Article created with ID: $article_id"
    else
        echo ""
        echo "❌ FAILED to create article"
    fi
}

main() {
    echo "=========================================="
    echo "  AI-Powered Article Generator"
    echo "=========================================="
    echo ""
    echo "Ollama: $OLLAMA_URL ($OLLAMA_MODEL)"
    echo "Strapi: $STRAPI_URL"
    echo ""

    check_ollama
    check_strapi

    if [ -n "$SELECTED_CATEGORY" ]; then
        process_category "$SELECTED_CATEGORY"
    else
        IFS='|' read -ra CATS <<< "$TECH_CATEGORIES"
        for cat in "${CATS[@]}"; do
            process_category "$cat"
        done
    fi

    echo ""
    echo "=========================================="
    echo "  Done!"
    echo "=========================================="
}

main
