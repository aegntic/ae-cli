import type { ProviderAdapter, Endpoint, RunInput, RunResult } from "@aegntic/sdk"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const endpoints: Endpoint[] = [
  {
    provider: "mock",
    path: "twitter/posts",
    description: "Search and retrieve recent posts from Twitter/X by keyword, hashtag, or user handle",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Search query, hashtag, or @handle", required: true },
        limit: { type: "number", description: "Max results to return", required: false, default: 10 },
        since: { type: "string", description: "ISO date for earliest results" },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.005, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "twitter/user",
    description: "Get Twitter/X user profile data including bio, follower count, and recent activity",
    inputSchema: {
      pathParams: { handle: { type: "string", description: "Twitter handle without @", required: true } },
    },
    costModel: { type: "per_call", unitPrice: 0.003, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "linkedin/posts",
    description: "Search LinkedIn posts by keyword, company, or author",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Search query", required: true },
        limit: { type: "number", description: "Max results", required: false, default: 10 },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.01, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "linkedin/company",
    description: "Get LinkedIn company profile data including size, industry, and description",
    inputSchema: {
      pathParams: { slug: { type: "string", description: "Company LinkedIn slug", required: true } },
    },
    costModel: { type: "per_call", unitPrice: 0.008, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "reddit/posts",
    description: "Search Reddit posts and threads by keyword, subreddit, or topic",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Search query", required: true },
        subreddit: { type: "string", description: "Limit to specific subreddit" },
        limit: { type: "number", description: "Max results", required: false, default: 10 },
        sort: { type: "string", description: "Sort order: relevance, new, top, hot" },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.003, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "google/search",
    description: "Perform a Google web search and return ranked results with snippets",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Search query", required: true },
        limit: { type: "number", description: "Max results", required: false, default: 10 },
        lang: { type: "string", description: "Language code (e.g. en)", required: false, default: "en" },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.002, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "amazon/products",
    description: "Search Amazon product listings by keyword with pricing and review data",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Product search query", required: true },
        limit: { type: "number", description: "Max results", required: false, default: 10 },
        minPrice: { type: "number", description: "Minimum price filter" },
        maxPrice: { type: "number", description: "Maximum price filter" },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.008, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "youtube/videos",
    description: "Search YouTube videos by keyword with view counts, duration, and channel info",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Video search query", required: true },
        limit: { type: "number", description: "Max results", required: false, default: 10 },
        order: { type: "string", description: "Sort order: relevance, date, views, rating" },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.004, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "people/search",
    description: "Find people across platforms by name, email, or company with social profile links",
    inputSchema: {
      queryParams: {
        name: { type: "string", description: "Full name to search" },
        email: { type: "string", description: "Email address" },
        company: { type: "string", description: "Company name" },
        limit: { type: "number", description: "Max results", required: false, default: 5 },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.02, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "weather/current",
    description: "Get current weather conditions for a city or coordinates",
    inputSchema: {
      queryParams: {
        location: { type: "string", description: "City name or lat,lon coordinates", required: true },
        units: { type: "string", description: "Temperature units: metric or imperial", required: false, default: "metric" },
      },
    },
    costModel: { type: "per_call", unitPrice: 0.001, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "news/articles",
    description: "Search recent news articles by topic, source, or keyword",
    inputSchema: {
      queryParams: {
        q: { type: "string", description: "Search query", required: true },
        limit: { type: "number", description: "Max results", required: false, default: 10 },
        source: { type: "string", description: "Filter by news source" },
        since: { type: "string", description: "ISO date for earliest results" },
      },
    },
    costModel: { type: "per_result", unitPrice: 0.003, currency: "USD" },
    verified: true,
  },
  {
    provider: "mock",
    path: "company/data",
    description: "Get company enrichment data including funding, employees, tech stack, and revenue",
    inputSchema: {
      body: {
        domain: { type: "string", description: "Company domain (e.g. stripe.com)", required: true },
        fields: { type: "array", description: "Specific fields to return" },
      },
      bodyType: "json",
    },
    costModel: { type: "per_call", unitPrice: 0.05, currency: "USD" },
    verified: true,
  },
]

const mockDataGenerators: Record<string, (input: RunInput) => unknown> = {
  "twitter/posts": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      id: `tw_${i}`,
      author: `@user${i}`,
      text: `Mock tweet about ${input.queryParams?.q ?? "topic"} #${i}`,
      likes: rand(5, 5000),
      retweets: rand(0, 1000),
      createdAt: new Date(Date.now() - rand(0, 86400000 * 7)).toISOString(),
    }))
  },
  "twitter/user": (input) => ({
    handle: input.pathParams?.handle ?? "unknown",
    name: "Mock User",
    bio: "Mock bio for testing",
    followers: rand(100, 500000),
    following: rand(50, 2000),
    verified: Math.random() > 0.5,
  }),
  "linkedin/posts": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      id: `li_${i}`,
      author: `Professional ${i}`,
      text: `LinkedIn post about ${input.queryParams?.q ?? "business"}`,
      reactions: rand(10, 2000),
      comments: rand(0, 200),
    }))
  },
  "linkedin/company": (input) => ({
    name: input.pathParams?.slug ?? "Acme Corp",
    size: `${rand(50, 10000)} employees`,
    industry: "Technology",
    description: "A mock company for testing purposes",
    founded: rand(1990, 2023),
  }),
  "reddit/posts": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      id: `rd_${i}`,
      subreddit: input.queryParams?.subreddit ?? "r/general",
      title: `Reddit post about ${input.queryParams?.q ?? "topic"}`,
      score: rand(1, 15000),
      comments: rand(0, 800),
      url: `https://reddit.com/r/mock/comments/mock${i}`,
    }))
  },
  "google/search": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      title: `Result ${i + 1} for ${input.queryParams?.q}`,
      url: `https://example${i}.com/article`,
      snippet: `This is a mock search result snippet describing ${input.queryParams?.q}...`,
      position: i + 1,
    }))
  },
  "amazon/products": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      title: `Mock Product ${i + 1} - ${input.queryParams?.q}`,
      price: (rand(999, 49999) / 100).toFixed(2),
      rating: (3 + Math.random() * 2).toFixed(1),
      reviews: rand(10, 8000),
      url: `https://amazon.com/dp/MOCK${i}`,
      image: `https://images.example.com/product${i}.jpg`,
    }))
  },
  "youtube/videos": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      title: `Video about ${input.queryParams?.q} - Part ${i + 1}`,
      channel: `Channel ${i}`,
      views: rand(100, 5000000),
      duration: `${rand(1, 60)}:${String(rand(0, 59)).padStart(2, "0")}`,
      publishedAt: new Date(Date.now() - rand(0, 86400000 * 365)).toISOString(),
      url: `https://youtube.com/watch?v=mock${i}`,
    }))
  },
  "people/search": (input) => {
    const limit = Number(input.queryParams?.limit) || 5
    return Array.from({ length: limit }, (_, i) => ({
      name: input.queryParams?.name ?? `Person ${i}`,
      email: input.queryParams?.email ?? `person${i}@example.com`,
      company: input.queryParams?.company ?? "Acme Corp",
      title: ["Engineer", "Designer", "PM", "Founder", "CTO"][i % 5],
      profiles: {
        linkedin: `https://linkedin.com/in/person${i}`,
        twitter: `https://twitter.com/person${i}`,
      },
    }))
  },
  "weather/current": (input) => ({
    location: input.queryParams?.location ?? "San Francisco",
    temperature: rand(5, 35),
    units: input.queryParams?.units ?? "metric",
    condition: ["Sunny", "Cloudy", "Rainy", "Windy"][rand(0, 3)],
    humidity: rand(30, 90),
    windSpeed: rand(0, 50),
  }),
  "news/articles": (input) => {
    const limit = Number(input.queryParams?.limit) || 10
    return Array.from({ length: limit }, (_, i) => ({
      title: `News article about ${input.queryParams?.q} #${i + 1}`,
      source: ["Reuters", "AP", "BBC", "TechCrunch", "Bloomberg"][i % 5],
      url: `https://news.example.com/article-${i}`,
      publishedAt: new Date(Date.now() - rand(0, 86400000 * 3)).toISOString(),
      snippet: `Breaking news about ${input.queryParams?.q}...`,
    }))
  },
  "company/data": (input) => ({
    name: "Acme Corp",
    domain: input.body?.domain ?? "acme.com",
    employees: rand(10, 50000),
    funding: `$${rand(1, 500)}M`,
    revenue: `$${rand(10, 9000)}M`,
    techStack: ["React", "Node.js", "PostgreSQL", "AWS"],
    description: "A mock company for testing",
    founded: rand(1980, 2023),
    hq: "San Francisco, CA",
  }),
}

export const mockProvider: ProviderAdapter = {
  name: "mock",
  endpoints,

  async execute(endpoint: string, input: RunInput): Promise<RunResult> {
    await delay(rand(100, 500))
    const generator = mockDataGenerators[endpoint]
    if (!generator) {
      throw new Error(`Unknown endpoint: ${endpoint}`)
    }
    const data = generator(input)
    const items = Array.isArray(data) ? data.length : 1
    const ep = endpoints.find((e) => e.path === endpoint)
    const cost = ep
      ? ep.costModel.type === "per_result"
        ? items * ep.costModel.unitPrice
        : ep.costModel.unitPrice
      : 0.01

    return { data, items, cost }
  },

  async estimateCost(endpoint: string, input: RunInput): Promise<number> {
    const ep = endpoints.find((e) => e.path === endpoint)
    if (!ep) return 0.01
    const estimatedItems = Number(input.queryParams?.limit ?? input.body?.limit ?? 10)
    return ep.costModel.type === "per_result"
      ? estimatedItems * ep.costModel.unitPrice
      : ep.costModel.unitPrice
  },
}

export default mockProvider
