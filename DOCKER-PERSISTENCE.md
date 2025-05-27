# Testing Template Persistence with Docker Compose

T# Copy templates from your local machine to the container
docker cp ./template-backup/. pdf-generation-service:/app/templatesverify that templates are correctly persisted between container restarts:

1. Start the service using Docker Compose:

   ```
   docker compose up -d
   ```

2. Access the template management UI at http://localhost:7070

3. Upload a new template

4. Restart the container:

   ```
   docker compose restart pdf-generation-service
   ```

5. Verify that your uploaded template is still available

# Working with Docker Named Volumes

The template persistence uses a Docker named volume (`pdf_templates`) rather than a bind mount. This provides several advantages:

- Better portability across different environments
- Cleaner Docker configuration
- Proper Docker-managed lifecycle for the data
- No need for local directory management

## Managing Templates in the Named Volume

To inspect the templates stored in the volume:

```powershell
# List the templates in the named volume
docker exec pdf-generation-service ls -la /app/templates
```

To back up templates from the volume to your local machine:

```powershell
# Create a backup directory
mkdir -p template-backup

# Copy templates from the container to your local machine
docker cp pdf-generation-service:/app/templates/. ./template-backup
```

To restore templates from a backup:

```powershell
# Copy templates from your local backup to the container
docker cp ./template-backup/. pdf-generation-service:/app/templates
```
