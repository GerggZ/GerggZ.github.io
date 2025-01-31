# Use a lightweight Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install system dependencies (Git is required for installing from GitHub)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy dependencies first (for better caching)
# It is set from the root directory because we run .yml
COPY projects/Wordle/backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install depedencies with my custom package upgraded
# RUN pip install --no-cache-dir --upgrade git+https://github.com/GerggZ/WordleSolver.git

# Copy the rest of the application
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
