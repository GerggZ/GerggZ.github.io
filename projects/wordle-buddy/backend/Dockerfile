# Use a lightweight Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install system dependencies (Git is required for installing from GitHub)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install NumPy separately to ensure caching
RUN pip install --no-cache-dir numpy

# Install the custom GitHub package separately (with --no-deps for speed)
RUN pip install --no-cache-dir --upgrade --no-deps git+https://github.com/GerggZ/WordleBuddy.git

# Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose FastAPI port
EXPOSE 8080

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
