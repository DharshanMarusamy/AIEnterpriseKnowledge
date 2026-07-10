# ---- Hugging Face Spaces compatible Dockerfile ----
# HF Spaces requires port 7860 and a non-root user

FROM python:3.11-slim

# Create non-root user (required by HF Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install system dependencies
RUN pip install --upgrade pip

# Copy and install Python dependencies first (for layer caching)
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=user . .

# Expose HF Spaces required port
EXPOSE 7860

# Start FastAPI using the PORT environment variable provided by the host (defaults to 8000)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
