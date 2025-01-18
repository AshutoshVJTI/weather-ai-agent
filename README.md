# AI Weather Agent

This project implements an AI-powered weather agent capable of fetching weather details for specified cities. It uses the OpenAI API for AI functionalities and the Weatherstack API for weather data.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AshutoshVJTI/weather-ai-agent.git
   cd weather-ai-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   WEATHERSTACK_API_KEY=your_weatherstack_api_key
   ```

## Usage

1. Start the application:
   ```bash
   node index.js
   ```

2. Enter your query when prompted. Example:
   ```
   >> What is the weather of Sacramento?
   ```

## Example Interaction

### Input
```bash
>> What is the weather of Sacramento?
```

### Output
```bash
🤖: The weather of Sacramento is 20°C.
```

## Dependencies

- **dotenv**: Loads environment variables.
- **axios**: Handles HTTP requests.
- **openai**: Interacts with the OpenAI API.
- **readline-sync**: Allows synchronous user input.
