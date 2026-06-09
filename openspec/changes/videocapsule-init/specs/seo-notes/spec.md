## ADDED Requirements

### Requirement: Auto-persist notes to database
Every AI-generated card SHALL be automatically saved to the database with full metadata including video info, transcript, AI summary, and card type.

#### Scenario: Note saved after generation
- **WHEN** AI card generation completes successfully
- **THEN** system saves a new record to the `notes` table with all fields populated and returns the note ID

### Requirement: Public SEO page at /notes/[id]
Each saved note SHALL be accessible as a public static page at the route `/notes/[id]`, fully renderable by search engine crawlers.

#### Scenario: Access note page
- **WHEN** user or crawler visits `/notes/abc123`
- **THEN** page renders the full card content with proper HTML semantics, headings, and structured data

#### Scenario: Non-existent note
- **WHEN** user visits `/notes/nonexistent`
- **THEN** system returns a 404 page with navigation back to home

### Requirement: SEO-optimized page metadata
Each note page SHALL include optimized title, meta description, and Open Graph tags for search engine and social media sharing.

#### Scenario: Page title format
- **WHEN** a note page is rendered
- **THEN** the `<title>` tag follows the format: `《【视频干货】{原视频标题}的文字笔记与步骤总结》`

#### Scenario: Open Graph tags
- **WHEN** a note page is crawled or shared
- **THEN** page includes `og:title`, `og:description`, `og:image` (card screenshot), and `og:type` meta tags

### Requirement: Notes listing index
The system SHALL provide a browsable index page at `/notes` showing all published notes with pagination.

#### Scenario: Browse notes list
- **WHEN** user visits `/notes`
- **THEN** page shows a paginated list of notes with title, excerpt, card type emoji, and creation date
