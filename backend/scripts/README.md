# AI-Powered Article Generator

Automatically generate blog articles using Ollama AI and Pollinations AI images.

## Overview

- **Generates ONE article per run** (ideal for daily scheduling)
- Dynamic date context in prompts
- Random category selection OR specify a category
- Auto-retry for image generation
- Duplicate prevention

## Requirements

- Ollama running (local or cloud)
- Strapi backend running
- Python 3.x

## Usage

### One Article (Random Category)

```bash
STRAPI_TOKEN="your-token" python3 scripts/generate-ai-articles.py
```

### Specific Category

```bash
STRAPI_TOKEN="your-token" python3 scripts/generate-ai-articles.py --category "AI"
```

### Available Categories

**Tech Trends:**
- AI
- Web Development
- Cloud
- DevOps
- Mobile
- Security

**Interview Prep:**
- Data Structures
- Algorithms
- System Design
- Coding Interview

## Command Line Options

| Option | Description |
|--------|-------------|
| `--token` | Strapi API token |
| `--ollama-url` | Ollama server URL |
| `--model` | Ollama model to use |
| `--category` | Specific category to generate for |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STRAPI_URL` | `http://localhost:4500` | Strapi server URL |
| `STRAPI_TOKEN` | (required) | Strapi API token |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma4:31b-cloud` | Ollama model to use |
| `BLOG_SLUG` | `wisdom` | Blog slug to post to |

## Cron Setup (Daily)

### 1. Create wrapper script

```bash
cat > ~/generate-articles.sh << 'EOF'
#!/bin/bash
STRAPI_TOKEN="your-token" \
OLLAMA_MODEL="gemma4:31b-cloud" \
python3 /home/trg/zenkai-blog/backend/scripts/generate-ai-articles.py >> /var/log/article-gen.log 2>&1
EOF
chmod +x ~/generate-articles.sh
```

### 2. Add to crontab

```bash
crontab -e
```

### 3. Add cron job (run daily at 6 AM)

```cron
# Run once per day at 6 AM
0 6 * * * /home/trg/generate-articles.sh
```

## How It Works

1. **Date Context**: Gets current month/year automatically
2. **Category Selection**: Random from all categories, or use `--category` flag
3. **Topic Generation**: Ollama generates trending topics (avoids duplicates)
4. **Content Creation**: Ollama writes comprehensive HTML article
5. **Image Generation**: Pollinations AI generates cover image
6. **Article Creation**: Posts to Strapi with cover image

## Troubleshooting

### Ollama not responding
```bash
curl http://localhost:11434/api/tags
```

### Strapi 401 errors
Verify your API token has article creation permissions

### Image generation fails
The script has built-in retry logic. If it still fails, the article is created without a cover image.
