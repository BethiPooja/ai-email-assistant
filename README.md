# Smart Email Assistant

An AI-powered Gmail Chrome extension that generates email replies based on the original email content and selected tone.

The project uses a **Spring Boot REST API** to communicate with the **Gemini API**, while a Chrome extension integrates the generated reply directly into Gmail.

## Features

* Generate AI-powered email replies
* Supports three tones:

    * Professional
    * Friendly
    * Formal
* Generates replies without a subject line
* Avoids inventing names, dates, companies, contact details, or signatures
* Inserts the generated reply directly into the Gmail compose box
* Gemini API key is stored using an environment variable instead of being hardcoded

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring WebFlux / WebClient
* REST API
* Gemini API

### Frontend / Extension

* JavaScript
* Chrome Extension
* Gmail integration

## How It Works

```text
Gmail
  ↓
Chrome Extension
  ↓
Spring Boot REST API
  ↓
Gemini API
  ↓
Generated Email Reply
  ↓
Chrome Extension
  ↓
Gmail Compose Box
```

## Project Structure

```text
email-writer-sb/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/email/writer/
│       │       ├── controller/
│       │       │   └── EmailGeneratorController.java
│       │       │
│       │       ├── DTO/
│       │       │   └── EmailRequest.java
│       │       │
│       │       └── service/
│       │           └── EmailGeneratorService.java
│       │
│       └── resources/
│           └── application.properties
│
├── frontend/
│   ├── content.js
│   ├── content.css
│   └── manifest.json
│
├── pom.xml
└── README.md
```

> Adjust the `extension/` folder structure above if your Chrome extension files are currently stored somewhere else in the repository.

## Backend Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd email-writer-sb
```

### 2. Configure the Gemini API key

The API key is **not stored directly in the source code**.

The application reads it from the `GEMINI_API_KEY` environment variable.

Your `application.properties` should contain:

```properties
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/interactions
gemini.api.key=${GEMINI_API_KEY}
```

Set the environment variable before running the application.

### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Do not commit your actual API key to GitHub.

### 3. Run the Spring Boot application

You can run the application from IntelliJ IDEA or using Maven:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

## API

### Generate Email Reply

**Endpoint**

```text
POST /api/email/generate
```

**Request**

```json
{
  "emailContent": "Hi, can you send me the project report by tomorrow?",
  "tone": "professional"
}
```

**Supported tones**

```text
professional
friendly
formal
```

**Response**

The API returns the generated email reply as plain text.

## Chrome Extension Setup

1. Open Chrome.
2. Go to:

```text
chrome://extensions/
```

3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the Chrome extension folder.
6. Open Gmail.
7. Open or compose an email.
8. Select a tone.
9. Click **AI Reply**.
10. The generated response will be inserted into the Gmail compose box.

## Security

The Gemini API key is loaded through an environment variable:

```properties
gemini.api.key=${GEMINI_API_KEY}
```

The API key should never be:

* Hardcoded in Java source code
* Added to `application.properties` with the real value
* Added to the Chrome extension
* Committed to GitHub
* Included in the README

If an API key is accidentally exposed or committed to GitHub, it should be revoked/rotated.

## Error Handling

The backend handles Gemini API errors and returns an error when the external API request fails.

The Chrome extension also displays an error message if the backend request fails or the Gmail compose box cannot be found.

## Current Limitations

* The backend currently runs locally.
* Gmail integration depends on Gmail's current page structure and selectors.
* The extension requires the Spring Boot backend to be running locally.
* The Gemini API requires a valid API key.

## Future Improvements

* Deploy the Spring Boot backend to a cloud platform
* Restrict CORS to the required extension/origin
* Improve email-content extraction
* Add loading and error states to the extension UI
* Add user-configurable reply length
* Add automated tests

## Author

**Pooja Bethi**

B.Sc. Computer Science
