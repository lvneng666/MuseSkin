# ==================== Runtime stage ====================
# The fat jar is built locally (`mvn package`) because this dev environment
# blocks direct HTTPS to Maven repos. On a normal CI/CD host, swap this for a
# standard multi-stage build: maven:3.9-eclipse-temurin-17 → eclipse-temurin:17-jre.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV PORT=8080
COPY target/peaffee-backend-0.1.0.jar app.jar
RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads && chown -R app:app /app
USER app
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar /app/app.jar"]
