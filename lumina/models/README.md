# Local AI Models

This directory is for storing local AI models if needed.

## Recommended Setup

Use Ollama for easy local model management:

```bash
# Install Ollama from https://ollama.ai

# Pull recommended models
ollama pull llama3:8b
ollama pull gemma:7b

# Verify installation
ollama list
```

## Alternative: Manual Model Files

If you prefer to use GGUF models directly:
- Place `.gguf` model files here
- Update backend configuration to point to these files
- Ensure adequate RAM (8GB+ for 7B models)

## Privacy Note

All models run locally. No data leaves your machine.
