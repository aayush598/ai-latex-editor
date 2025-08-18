FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl texlive-latex-base texlive-fonts-recommended texlive-pictures texlive-latex-extra
RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net |sh


# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Run app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
