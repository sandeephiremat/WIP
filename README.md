# WebInsight Pro: Technical & SEO Analyzer

WebInsight Pro is a high-performance, client-side web auditing tool designed for developers, SEO specialists, and accessibility advocates. It performs deep-crawling of any public webpage to extract critical technical metrics, visual assets, semantic structures, and AI-powered optimization recommendations.

## 🚀 Key Features

- **Multi-Strategy Web Crawling**: Uses a robust, multi-proxy fallback system (AllOrigins, CodeTabs, CorsProxy) to bypass CORS restrictions and fetch live HTML content directly in the browser.
- **AI-Powered Auditing**: Integrated with Google Gemini 3 Flash to provide intelligent SEO and Accessibility summaries and prioritized fix lists.
- **Accessibility Suite**: 
  - Automated Header Hierarchy validation.
  - ARIA attribute and Semantic Role mapping.
  - Image Alt-text audit with empty-attribute highlighting.
  - Landmark detection (Banner, Main, ContentInfo).
- **Technical SEO**: Extracts metadata (Title, Description), SSL status, and robots.txt reachability.
- **Visual & Link Analysis**: 
  - Comprehensive hyperlink mapping (Internal vs. External).
  - Image asset extraction with broken-link handling.
- **CSS Intelligence**: Extracts a unique color palette from the page and tracks inline style usage frequency.
- **Data Visualization**: Interactive dashboards powered by Recharts to visualize page complexity and issue density.

## 🛠️ Technical Stack

- **Framework**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Intelligence**: [Google Gemini API (@google/genai)](https://ai.google.dev/)
- **Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Font Awesome 6](https://fontawesome.com/)
- **Runtime**: ES Modules via [esm.sh](https://esm.sh/)

## 🏗️ Architecture

The application is built with a modular service-oriented architecture:

### 1. The Crawler Service (`services/crawler.ts`)
Since browsers cannot fetch cross-origin HTML directly due to security policies, this service implements a sequential fallback logic:
1. **Primary**: `api.allorigins.win` (JSONP-wrapped content).
2. **Secondary**: `api.codetabs.com` (Raw proxy).
3. **Tertiary**: `corsproxy.io` (Public CORS gateway).
It uses `DOMParser` to convert the raw string into a queryable Document object.

### 2. The Intelligence Layer (`services/geminiService.ts`)
Converts the structured JSON analysis into a natural language audit. It uses specific system instructions and JSON schemas to ensure the AI output is strictly formatted for the UI components.

### 3. Component Hierarchy
- **`App.tsx`**: State coordinator and tab navigator.
- **`DashboardHeader`**: Input handling and URL normalization.
- **`SummaryTab`**: Aggregates data from all sub-services into a high-level executive dashboard.

## 💻 Installation & Setup

### Prerequisites
- Node.js (for local development)
- A Google Gemini API Key

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/webinsight-pro.git
   cd webinsight-pro
   ```

2. **Install Dependencies**:
   This project uses ESM imports. If you are running in a standard Node environment, ensure you have a local server.
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the application**:
   ```bash
   npm start
   ```

## 📖 Usage

1. **Enter URL**: Type any full URL (e.g., `https://google.com`) into the top search bar.
2. **Analyze**: Click "Analyze". The crawler will attempt to fetch and parse the page.
3. **Review Summary**: Check the dashboard for the Accessibility Score and Metric Overview.
4. **Deep Dive**: Use the tabs to explore:
   - **Links**: Check for external dependencies and link naming.
   - **Images**: See which images lack `alt` text.
   - **Accessibility**: Review the H-tag structure and ARIA labels.
   - **CSS**: Inspect the brand's extracted color palette.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
