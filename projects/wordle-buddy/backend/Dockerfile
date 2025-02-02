# Use a lightweight Python image
FROM python:3.9-slim

WORKDIR /app

# Install Git (needed for `git+` dependencies)
RUN apt-get update && apt-get install -y git

# Copy dependencies first for caching
COPY projects/wordle-buddy/backend/requirements.txt .
#COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app
COPY projects/wordle-buddy/backend .
#COPY . .

# Expose the port (optional, but good practice)
EXPOSE 8000

# Run Uvicorn
CMD ["uvicorn", "wordle_buddy_main:app", "--host", "0.0.0.0", "--port", "8080"]
