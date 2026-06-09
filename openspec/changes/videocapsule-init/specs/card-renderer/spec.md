## ADDED Requirements

### Requirement: Card component system
The frontend SHALL implement a card rendering component system that displays AI-generated content in visually appealing card formats with support for multiple card types.

#### Scenario: Recipe card display
- **WHEN** card type is `recipe`
- **THEN** card renders with: header emoji (🍳), ingredients list, numbered steps with emoji markers, conclusion section, and star rating

#### Scenario: Insight card display
- **WHEN** card type is `insight`
- **THEN** card renders with: header emoji (💡), key quotes in styled blocks, action checklist, conclusion section, and star rating

### Requirement: Dark mode design system
The UI SHALL implement a modern dark-mode-first design system inspired by Linear/Notion, featuring glassmorphism effects, soft shadows, and subtle gradients.

#### Scenario: Dark mode default
- **WHEN** user visits the application
- **THEN** interface renders in dark mode with glassmorphism card effects and high-contrast text

#### Scenario: Light mode toggle
- **WHEN** user clicks the theme toggle
- **THEN** interface switches to a high-saturation light theme with contrasting colors

### Requirement: One-click long image export
The system SHALL allow users to export any card as a beautifully formatted long image (PNG) with one click.

#### Scenario: Export card as image
- **WHEN** user clicks the "导出长图" button on a card
- **THEN** system generates a PNG image of the full card with proper styling and downloads it

### Requirement: Central input interface
The main page SHALL feature a prominent centered input field for pasting video links, with results rendered directly below as cards.

#### Scenario: Paste and process
- **WHEN** user pastes a Douyin link into the input field and clicks submit
- **THEN** loading animation appears, followed by the rendered card below the input
