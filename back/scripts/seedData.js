const mongoose = require('mongoose');
const Article = require('../models/Article');
const User = require('../models/User');
require('dotenv').config();

const sampleArticles = [
  {
    title: "The Future of Artificial Intelligence: Trends and Predictions for 2024",
    slug: "future-of-artificial-intelligence-trends-2024",
    excerpt: "Explore the latest developments in AI technology and what to expect in the coming year. From machine learning breakthroughs to ethical considerations.",
    content: `
      <h1>The Future of Artificial Intelligence: Trends and Predictions for 2024</h1>
      
      <p>Artificial Intelligence continues to evolve at an unprecedented pace, reshaping industries and transforming how we live and work. As we approach 2024, several key trends are emerging that will define the future of AI technology.</p>
      
      <h2>Machine Learning Breakthroughs</h2>
      <p>Recent advances in machine learning algorithms have enabled more sophisticated AI systems. These breakthroughs are driving innovation across various sectors, from healthcare to finance.</p>
      
      <h2>Ethical AI Development</h2>
      <p>As AI becomes more integrated into our daily lives, ethical considerations are taking center stage. Developers and organizations are focusing on creating responsible AI systems that prioritize fairness and transparency.</p>
      
      <h3>Key Considerations</h3>
      <ul>
        <li>Bias detection and mitigation</li>
        <li>Privacy protection</li>
        <li>Accountability frameworks</li>
        <li>Human oversight mechanisms</li>
      </ul>
      
      <h2>Industry Applications</h2>
      <p>AI is revolutionizing multiple industries, including healthcare, education, and transportation. These applications are creating new opportunities and challenges for businesses and society.</p>
      
      <p>As we look ahead to 2024, the continued development of AI technology promises to bring both exciting opportunities and important challenges that we must address collectively.</p>
    `,
    meta: {
      title: "Future of AI: Trends and Predictions for 2024",
      description: "Explore the latest developments in AI technology and what to expect in the coming year. From machine learning breakthroughs to ethical considerations.",
      keywords: ["artificial intelligence", "AI trends", "machine learning", "technology 2024", "AI ethics"]
    },
    ogTags: {
      title: "The Future of Artificial Intelligence: Trends and Predictions for 2024",
      description: "Explore the latest developments in AI technology and what to expect in the coming year.",
      image: "https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=AI+Future",
      url: "http://localhost:3000/article/future-of-artificial-intelligence-trends-2024"
    },
    trendingTopic: "Artificial Intelligence",
    source: "manual",
    status: "published",
    seoScore: 85,
    readTime: 5,
    media: {
      images: [
        {
          url: "https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=AI+Technology",
          alt: "Artificial Intelligence Technology",
          caption: "AI technology visualization"
        }
      ],
      videos: [
        {
          url: "https://www.youtube.com/results?search_query=artificial+intelligence+2024",
          title: "AI Trends 2024",
          platform: "youtube"
        }
      ],
      tweets: [
        {
          url: "https://twitter.com/intent/tweet?text=Discover the latest insights about Artificial Intelligence!",
          content: "Discover the latest insights about Artificial Intelligence!",
          author: "TrendWise"
        }
      ]
    },
    hashtags: ["#AI", "#Technology", "#Innovation"]
  },
  {
    title: "Sustainable Living: Practical Tips for Reducing Your Carbon Footprint",
    slug: "sustainable-living-carbon-footprint-tips",
    excerpt: "Learn practical ways to live more sustainably and reduce your environmental impact. Simple changes that make a big difference for our planet.",
    content: `
      <h1>Sustainable Living: Practical Tips for Reducing Your Carbon Footprint</h1>
      
      <p>Sustainable living is becoming increasingly important as we face environmental challenges. Making small changes in our daily lives can have a significant impact on reducing our carbon footprint.</p>
      
      <h2>Energy Conservation</h2>
      <p>One of the most effective ways to reduce your carbon footprint is through energy conservation. Simple changes like switching to LED bulbs and using energy-efficient appliances can make a big difference.</p>
      
      <h3>Energy-Saving Tips</h3>
      <ul>
        <li>Switch to LED lighting</li>
        <li>Use programmable thermostats</li>
        <li>Unplug electronics when not in use</li>
        <li>Choose energy-efficient appliances</li>
      </ul>
      
      <h2>Transportation Choices</h2>
      <p>Transportation is a major contributor to carbon emissions. Consider walking, cycling, or using public transportation when possible. Electric vehicles are also becoming more accessible and affordable.</p>
      
      <h2>Waste Reduction</h2>
      <p>Reducing waste through recycling, composting, and choosing products with minimal packaging can significantly reduce your environmental impact.</p>
      
      <p>By implementing these sustainable practices, you can contribute to a healthier planet while often saving money in the process.</p>
    `,
    meta: {
      title: "Sustainable Living: Reduce Your Carbon Footprint",
      description: "Learn practical ways to live more sustainably and reduce your environmental impact. Simple changes that make a big difference.",
      keywords: ["sustainable living", "carbon footprint", "environment", "green living", "eco-friendly"]
    },
    ogTags: {
      title: "Sustainable Living: Practical Tips for Reducing Your Carbon Footprint",
      description: "Learn practical ways to live more sustainably and reduce your environmental impact.",
      image: "https://via.placeholder.com/800x400/22C55E/FFFFFF?text=Sustainable+Living",
      url: "http://localhost:3000/article/sustainable-living-carbon-footprint-tips"
    },
    trendingTopic: "Sustainable Living",
    source: "manual",
    status: "published",
    seoScore: 82,
    readTime: 4,
    media: {
      images: [
        {
          url: "https://via.placeholder.com/800x400/22C55E/FFFFFF?text=Green+Living",
          alt: "Sustainable Living",
          caption: "Eco-friendly lifestyle"
        }
      ],
      videos: [
        {
          url: "https://www.youtube.com/results?search_query=sustainable+living+tips",
          title: "Sustainable Living Guide",
          platform: "youtube"
        }
      ],
      tweets: [
        {
          url: "https://twitter.com/intent/tweet?text=Learn how to live more sustainably and reduce your carbon footprint!",
          content: "Learn how to live more sustainably and reduce your carbon footprint!",
          author: "TrendWise"
        }
      ]
    },
    hashtags: ["#Sustainability", "#GreenLiving", "#EcoFriendly"]
  },
  {
    title: "Remote Work Revolution: Building Effective Virtual Teams",
    slug: "remote-work-revolution-virtual-teams",
    excerpt: "Discover strategies for building and managing effective virtual teams in the remote work era. Tools, communication, and productivity tips.",
    content: `
      <h1>Remote Work Revolution: Building Effective Virtual Teams</h1>
      
      <p>The remote work revolution has transformed how organizations operate and how teams collaborate. Building effective virtual teams requires new strategies and tools.</p>
      
      <h2>Communication Tools</h2>
      <p>Effective communication is the foundation of successful virtual teams. Modern tools like Slack, Microsoft Teams, and Zoom have made remote collaboration easier than ever.</p>
      
      <h3>Essential Communication Platforms</h3>
      <ul>
        <li>Video conferencing tools</li>
        <li>Instant messaging platforms</li>
        <li>Project management software</li>
        <li>Document collaboration tools</li>
      </ul>
      
      <h2>Team Building Strategies</h2>
      <p>Building strong relationships in virtual teams requires intentional effort. Regular check-ins, virtual team building activities, and clear communication protocols are essential.</p>
      
      <h2>Productivity and Accountability</h2>
      <p>Maintaining productivity in remote teams involves setting clear expectations, using project management tools, and establishing regular feedback mechanisms.</p>
      
      <p>The remote work revolution is here to stay, and organizations that adapt quickly will have a competitive advantage in attracting and retaining top talent.</p>
    `,
    meta: {
      title: "Remote Work Revolution: Building Virtual Teams",
      description: "Discover strategies for building and managing effective virtual teams in the remote work era. Tools, communication, and productivity tips.",
      keywords: ["remote work", "virtual teams", "work from home", "team collaboration", "productivity"]
    },
    ogTags: {
      title: "Remote Work Revolution: Building Effective Virtual Teams",
      description: "Discover strategies for building and managing effective virtual teams in the remote work era.",
      image: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Remote+Work",
      url: "http://localhost:3000/article/remote-work-revolution-virtual-teams"
    },
    trendingTopic: "Remote Work",
    source: "manual",
    status: "published",
    seoScore: 88,
    readTime: 6,
    media: {
      images: [
        {
          url: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Virtual+Teams",
          alt: "Remote Work Team",
          caption: "Virtual team collaboration"
        }
      ],
      videos: [
        {
          url: "https://www.youtube.com/results?search_query=remote+work+teams",
          title: "Remote Team Management",
          platform: "youtube"
        }
      ],
      tweets: [
        {
          url: "https://twitter.com/intent/tweet?text=Learn how to build effective virtual teams in the remote work era!",
          content: "Learn how to build effective virtual teams in the remote work era!",
          author: "TrendWise"
        }
      ]
    },
    hashtags: ["#RemoteWork", "#VirtualTeams", "#WorkFromHome"]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise');
    console.log('Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Insert sample articles
    const articles = await Article.insertMany(sampleArticles);
    console.log(`Inserted ${articles.length} sample articles`);

    // Create a sample admin user
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@trendwise.com' },
      {
        googleId: 'admin123',
        name: 'Admin User',
        email: 'admin@trendwise.com',
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    console.log('Created admin user:', adminUser.email);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 