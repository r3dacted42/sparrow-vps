FROM cicirello/pyaction
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
ENV ALLOWED_ORIGINS="http://localhost:5173,http://my-frontend.com" \
    CLONE_BASE_DIR="/temp"
CMD [ "fastapi", "run", "app/main.py" ]
