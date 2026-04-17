# AI-Powered Article Generator

Automatically generate blog articles using Ollama AI and Unsplash images.

## Requirements

- Ollama running (local or cloud)
- Strapi backend running
- Python 3.x

## Installation

Install Python dependencies (optional, script uses subprocess for curl):

```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

```bash
# Set environment variables
export STRAPI_TOKEN="your-strapi-token"
export OLLAMA_MODEL="gemma4:31b-cloud"  # or any model you have

# Generate articles for all categories
python3 scripts/generate-ai-articles.py

# Generate for specific category
python3 scripts/generate-ai-articles.py --category "AI"
```

### Command Line Options

```bash
python3 scripts/generate-ai-articles.py \
  --token "your-strapi-token" \
  --ollama-url "http://localhost:11434" \
  --model "qwen3:4b" \
  --category "AI"
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STRAPI_URL` | `http://localhost:4500` | Strapi server URL |
| `STRAPI_TOKEN` | (required) | Strapi API token |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma4:31b-cloud` | Ollama model to use |
| `UNSPLASH_ACCESS_KEY` | (optional) | Unsplash API key for cover images |

### Getting Unsplash API Key (Optional)

1. Sign up at https://unsplash.com/developers
2. Create a new application
3. Copy the Access Key

Without this, a default tech image will be used.

## Cron Setup (Daily Generation)

### 1. Create a wrapper script

```bash
cat > ~/generate-articles.sh << 'EOF'
#!/bin/bash
cd /home/trg/zenkai-blog/backend
STRAPI_TOKEN="your-token" \
OLLAMA_MODEL="gemma4:31b-cloud" \
python3 scripts/generate-ai-articles.py >> /var/log/article-gen.log 2>&1
EOF
chmod +x ~/generate-articles.sh
```

### 2. Add to crontab

```bash
crontab -e
```

### 3. Add cron job

```cron
# Run every day at 6 AM
0 6 * * * /home/trg/generate-articles.sh

# Or run every Monday at 8 AM
0 8 * * 1 /home/trg/generate-articles.sh
```

### 4. View logs

```bash
tail -f /var/log/article-gen.log
```

## Categories

The script generates articles for these categories:
- AI
- Web Development
- Cloud
- DevOps
- Mobile
- Security

## How It Works

1. **Topic Generation**: Ollama generates trending tech topics based on the category
2. **Content Creation**: Ollama writes comprehensive HTML article content
3. **Image Search**: Unsplash API finds relevant cover images (or uses default)
4. **Article Creation**: Everything is posted to Strapi via REST API

## Troubleshooting

### Ollama not responding
- Check if Ollama is running: `curl http://localhost:11434/api/tags`
- Try a different model: `--model llama3.2`

### Strapi 401 errors
- Verify your API token is valid
- Check token has article creation permissions

### Image upload fails
- Set `UNSPLASH_ACCESS_KEY` for better images
- Script will use default image if upload fails
