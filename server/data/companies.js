

const companies = [
  // Technology Giants - Global
  {
    name: 'google',
    displayName: 'Google',
    logo: 'https://logo.clearbit.com/google.com',
    linkedinUrl: 'https://linkedin.com/company/google',
    website: 'https://www.google.com',
    industry: 'Technology',
    size: '180,000+ employees',
    aliases: ['alphabet', 'googl'],
    isVerified: true,
    linkedinData: {
      description: 'American on‑demand financial management and human capital management software vendor.',
      headquarters: 'Pleasanton, CA, USA',
      employeeCount: '18,500+',
      founded: '2005'
    }
  },

  {
    name: 'epam systems',
    displayName: 'EPAM Systems',
    logo: 'https://logo.clearbit.com/epam.com',
    linkedinUrl: 'https://linkedin.com/company/epam-systems',
    website: 'https://www.epam.com',
    industry: 'IT Services',
    size: '58,900+ employees',
    aliases: ['epam'],
    isVerified: true,
    linkedinData: {
      description: 'American company that specializes in product development, digital platform engineering, and digital and product design services.',
      headquarters: 'Newtown, PA, USA',
      employeeCount: '58,900+',
      founded: '1993'
    }
  },

  {
    name: 'intuit',
    displayName: 'Intuit',
    logo: 'https://logo.clearbit.com/intuit.com',
    linkedinUrl: 'https://linkedin.com/company/intuit',
    website: 'https://www.intuit.com',
    industry: 'Financial Software',
    size: '17,300+ employees',
    aliases: ['intu'],
    isVerified: true,
    linkedinData: {
      description: 'Business and financial software company that develops and sells financial, accounting, and tax preparation software.',
      headquarters: 'Mountain View, CA, USA',
      employeeCount: '17,300+',
      founded: '1983'
    }
  },

  {
    name: 'hpe',
    displayName: 'HPE',
    logo: 'https://logo.clearbit.com/hpe.com',
    linkedinUrl: 'https://linkedin.com/company/hewlett-packard-enterprise',
    website: 'https://www.hpe.com',
    industry: 'Information Technology',
    size: '60,000+ employees',
    aliases: ['hewlett packard enterprise', 'hpe'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational enterprise information technology company.',
      headquarters: 'Spring, TX, USA',
      employeeCount: '60,000+',
      founded: '2015'
    }
  },

  {
    name: 'dover',
    displayName: 'Dover',
    logo: 'https://logo.clearbit.com/dovercorporation.com',
    linkedinUrl: 'https://linkedin.com/company/dover-corporation',
    website: 'https://www.dovercorporation.com',
    industry: 'Industrial Manufacturing',
    size: '24,000+ employees',
    aliases: ['dover corporation', 'dov'],
    isVerified: true,
    linkedinData: {
      description: 'American diversified manufacturer of industrial products and manufacturing equipment.',
      headquarters: 'Downers Grove, IL, USA',
      employeeCount: '24,000+',
      founded: '1955'
    }
  },

  {
    name: 'schneider electric',
    displayName: 'Schneider Electric',
    logo: 'https://logo.clearbit.com/schneider-electric.com',
    linkedinUrl: 'https://linkedin.com/company/schneider-electric',
    website: 'https://www.schneider-electric.com',
    industry: 'Energy Management',
    size: '150,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'French multinational corporation that provides energy and automation digital solutions.',
      headquarters: 'Rueil-Malmaison, France',
      employeeCount: '150,000+',
      founded: '1836'
    }
  },

  {
    name: 'alstom',
    displayName: 'Alstom',
    logo: 'https://logo.clearbit.com/alstom.com',
    linkedinUrl: 'https://linkedin.com/company/alstom',
    website: 'https://www.alstom.com',
    industry: 'Transportation Equipment',
    size: '80,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'French multinational company which manufactures trains, metros, trams, e-buses, and related signalling equipment.',
      headquarters: 'Saint-Ouen-sur-Seine, France',
      employeeCount: '80,000+',
      founded: '1928'
    }
  },

  {
    name: 'aptiv',
    displayName: 'Aptiv',
    logo: 'https://logo.clearbit.com/aptiv.com',
    linkedinUrl: 'https://linkedin.com/company/aptiv',
    website: 'https://www.aptiv.com',
    industry: 'Automotive Technology',
    size: '190,000+ employees',
    aliases: ['aptv'],
    isVerified: true,
    linkedinData: {
      description: 'Global technology company that develops safer, greener and more connected solutions.',
      headquarters: 'Dublin, Ireland',
      employeeCount: '190,000+',
      founded: '2017'
    }
  },

  {
    name: 'thorogood associates',
    displayName: 'Thorogood Associates',
    logo: 'https://logo.clearbit.com/thorogood.net',
    linkedinUrl: 'https://linkedin.com/company/thorogood-associates',
    website: 'https://www.thorogood.net',
    industry: 'IT Consulting',
    size: '1,000+ employees',
    aliases: ['thorogood'],
    isVerified: true,
    linkedinData: {
      description: 'Global technology consulting company providing IT and business consulting services.',
      headquarters: 'London, UK',
      employeeCount: '1,000+',
      founded: '1978'
    }
  },

  {
    name: 'mu sigma',
    displayName: 'Mu Sigma',
    logo: 'https://logo.clearbit.com/mu-sigma.com',
    linkedinUrl: 'https://linkedin.com/company/mu-sigma',
    website: 'https://www.mu-sigma.com',
    industry: 'Data Analytics',
    size: '3,500+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Decision sciences and analytics company that helps organizations institutionalize data-driven decision making.',
      headquarters: 'Chicago, IL, USA',
      employeeCount: '3,500+',
      founded: '2004'
    }
  },

  {
    name: 'themathcompany',
    displayName: 'TheMathCompany',
    logo: 'https://logo.clearbit.com/themathcompany.com',
    linkedinUrl: 'https://linkedin.com/company/themathcompany',
    website: 'https://www.themathcompany.com',
    industry: 'Data Analytics',
    size: '1,200+ employees',
    aliases: ['the math company', 'math company'],
    isVerified: true,
    linkedinData: {
      description: 'Data science and analytics consulting company providing advanced analytics, AI, and machine learning solutions.',
      headquarters: 'Chennai, India',
      employeeCount: '1,200+',
      founded: '2016'
    }
  },

  {
    name: 'expeditors',
    displayName: 'Expeditors',
    logo: 'https://logo.clearbit.com/expeditors.com',
    linkedinUrl: 'https://linkedin.com/company/expeditors',
    website: 'https://www.expeditors.com',
    industry: 'Logistics',
    size: '19,000+ employees',
    aliases: ['expd'],
    isVerified: true,
    linkedinData: {
      description: 'Global logistics company providing freight forwarding, customs brokerage, cargo insurance, and other logistics services.',
      headquarters: 'Seattle, WA, USA',
      employeeCount: '19,000+',
      founded: '1979'
    }
  },

  {
    name: 'infibeam avenues',
    displayName: 'Infibeam Avenues',
    logo: 'https://logo.clearbit.com/infibeam.com',
    linkedinUrl: 'https://linkedin.com/company/infibeam-avenues',
    website: 'https://www.infibeam.com',
    industry: 'E-commerce & Fintech',
    size: '1,500+ employees',
    aliases: ['infibeam'],
    isVerified: true,
    linkedinData: {
      description: 'Indian e-commerce and financial technology company providing digital payment solutions.',
      headquarters: 'Gandhinagar, India',
      employeeCount: '1,500+',
      founded: '2007'
    }
  },

  {
    name: 'contentstack',
    displayName: 'Contentstack',
    logo: 'https://logo.clearbit.com/contentstack.com',
    linkedinUrl: 'https://linkedin.com/company/contentstack',
    website: 'https://www.contentstack.com',
    industry: 'Content Management',
    size: '500+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Headless content management system that enables brands to create, manage, and deliver digital experiences.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '500+',
      founded: '2018'
    }
  },

  {
    name: 'fiorano software',
    displayName: 'Fiorano Software',
    logo: 'https://logo.clearbit.com/fiorano.com',
    linkedinUrl: 'https://linkedin.com/company/fiorano-software',
    website: 'https://www.fiorano.com',
    industry: 'Software',
    size: '500+ employees',
    aliases: ['fiorano'],
    isVerified: true,
    linkedinData: {
      description: 'Software company specializing in enterprise integration, API management, and digital transformation solutions.',
      headquarters: 'San Jose, CA, USA',
      employeeCount: '500+',
      founded: '1995'
    }
  },

  {
    name: 'mobicip',
    displayName: 'Mobicip',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/mobicip',
    website: 'https://www.mobicip.com',
    industry: 'Parental Control Software',
    size: '50+ employees',
    aliases: [],
    isVerified: false,
    linkedinData: {
      description: 'Parental control and internet safety software for families.',
      headquarters: 'Mountain View, CA, USA',
      employeeCount: '50+',
      founded: '2009'
    }
  },

  // Additional Notable Companies
  {
    name: 'stripe',
    displayName: 'Stripe',
    logo: 'https://logo.clearbit.com/stripe.com',
    linkedinUrl: 'https://linkedin.com/company/stripe',
    website: 'https://stripe.com',
    industry: 'Financial Technology',
    size: '8,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Irish-American financial services and software as a service company that offers payment processing software.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '8,000+',
      founded: '2010'
    }
  },

  {
    name: 'square',
    displayName: 'Square',
    logo: 'https://logo.clearbit.com/squareup.com',
    linkedinUrl: 'https://linkedin.com/company/square',
    website: 'https://squareup.com',
    industry: 'Financial Technology',
    size: '8,000+ employees',
    aliases: ['block', 'sq'],
    isVerified: true,
    linkedinData: {
      description: 'American financial services and digital payments company.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '8,000+',
      founded: '2009'
    }
  },

  {
    name: 'coinbase',
    displayName: 'Coinbase',
    logo: 'https://logo.clearbit.com/coinbase.com',
    linkedinUrl: 'https://linkedin.com/company/coinbase',
    website: 'https://www.coinbase.com',
    industry: 'Cryptocurrency',
    size: '4,900+ employees',
    aliases: ['coin'],
    isVerified: true,
    linkedinData: {
      description: 'American publicly traded company that operates a cryptocurrency exchange platform.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '4,900+',
      founded: '2012'
    }
  },

  {
    name: 'robinhood',
    displayName: 'Robinhood',
    logo: 'https://logo.clearbit.com/robinhood.com',
    linkedinUrl: 'https://linkedin.com/company/robinhood',
    website: 'https://robinhood.com',
    industry: 'Financial Technology',
    size: '3,400+ employees',
    aliases: ['hood'],
    isVerified: true,
    linkedinData: {
      description: 'American financial services company that offers commission-free stock trading.',
      headquarters: 'Menlo Park, CA, USA',
      employeeCount: '3,400+',
      founded: '2013'
    }
  },

  {
    name: 'wealthfront',
    displayName: 'Wealthfront',
    logo: 'https://logo.clearbit.com/wealthfront.com',
    linkedinUrl: 'https://linkedin.com/company/wealthfront',
    website: 'https://www.wealthfront.com',
    industry: 'Financial Technology',
    size: '500+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'American automated investment service company that provides robo-advisory services.',
      headquarters: 'Palo Alto, CA, USA',
      employeeCount: '500+',
      founded: '2008'
    }
  },

  // More Indian Companies
  {
    name: 'kotak mahindra bank',
    displayName: 'Kotak Mahindra Bank',
    logo: 'https://logo.clearbit.com/kotak.com',
    linkedinUrl: 'https://linkedin.com/company/kotak-mahindra-bank',
    website: 'https://www.kotak.com',
    industry: 'Banking',
    size: '95,000+ employees',
    aliases: ['kotak'],
    isVerified: true,
    linkedinData: {
      description: 'Indian private sector bank that provides banking and financial services.',
      headquarters: 'Mumbai, India',
      employeeCount: '95,000+',
      founded: '1985'
    }
  },

  {
    name: 'yes bank',
    displayName: 'Yes Bank',
    logo: 'https://logo.clearbit.com/yesbank.in',
    linkedinUrl: 'https://linkedin.com/company/yes-bank',
    website: 'https://www.yesbank.in',
    industry: 'Banking',
    size: '25,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian private sector bank headquartered in Mumbai.',
      headquarters: 'Mumbai, India',
      employeeCount: '25,000+',
      founded: '2004'
    }
  },

  {
    name: 'bajaj finserv',
    displayName: 'Bajaj Finserv',
    logo: 'https://logo.clearbit.com/bajajfinserv.in',
    linkedinUrl: 'https://linkedin.com/company/bajaj-finserv',
    website: 'https://www.bajajfinserv.in',
    industry: 'Financial Services',
    size: '45,000+ employees',
    aliases: ['bajaj'],
    isVerified: true,
    linkedinData: {
      description: 'Indian financial services company offering lending, insurance, and investment services.',
      headquarters: 'Pune, India',
      employeeCount: '45,000+',
      founded: '2007'
    }
  },

  {
    name: 'microsoft',
    displayName: 'Microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    linkedinUrl: 'https://linkedin.com/company/microsoft',
    website: 'https://www.microsoft.com',
    industry: 'Technology',
    size: '220,000+ employees',
    aliases: ['msft', 'microsoft corp'],
    isVerified: true,
    linkedinData: {
      description: 'Multinational technology corporation that produces computer software, consumer electronics, personal computers, and related services.',
      headquarters: 'Redmond, WA, USA',
      employeeCount: '220,000+',
      founded: '1975'
    }
  },

  {
    name: 'apple',
    displayName: 'Apple',
    logo: 'https://logo.clearbit.com/apple.com',
    linkedinUrl: 'https://linkedin.com/company/apple',
    website: 'https://www.apple.com',
    industry: 'Technology',
    size: '160,000+ employees',
    aliases: ['apple inc', 'aapl'],
    isVerified: true,
    linkedinData: {
      description: 'Multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services.',
      headquarters: 'Cupertino, CA, USA',
      employeeCount: '160,000+',
      founded: '1976'
    }
  },

  {
    name: 'amazon',
    displayName: 'Amazon',
    logo: 'https://logo.clearbit.com/amazon.com',
    linkedinUrl: 'https://linkedin.com/company/amazon',
    website: 'https://www.amazon.com',
    industry: 'E-commerce & Cloud Computing',
    size: '1,500,000+ employees',
    aliases: ['aws', 'amazon web services', 'amzn'],
    isVerified: true,
    linkedinData: {
      description: 'Multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
      headquarters: 'Seattle, WA, USA',
      employeeCount: '1,500,000+',
      founded: '1994'
    }
  },

  {
    name: 'meta',
    displayName: 'Meta',
    logo: 'https://logo.clearbit.com/meta.com',
    linkedinUrl: 'https://linkedin.com/company/meta',
    website: 'https://www.meta.com',
    industry: 'Social Media & Technology',
    size: '85,000+ employees',
    aliases: ['facebook', 'instagram', 'whatsapp'],
    isVerified: true,
    linkedinData: {
      description: 'Social technology company that builds technology to help people connect, find communities, and grow businesses.',
      headquarters: 'Menlo Park, CA, USA',
      employeeCount: '85,000+',
      founded: '2004'
    }
  },

  {
    name: 'netflix',
    displayName: 'Netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    linkedinUrl: 'https://linkedin.com/company/netflix',
    website: 'https://www.netflix.com',
    industry: 'Entertainment',
    size: '15,000+ employees',
    aliases: ['nflx'],
    isVerified: true,
    linkedinData: {
      description: 'American subscription streaming service and production company.',
      headquarters: 'Los Gatos, CA, USA',
      employeeCount: '15,000+',
      founded: '1997'
    }
  },

  {
    name: 'tesla',
    displayName: 'Tesla',
    logo: 'https://logo.clearbit.com/tesla.com',
    linkedinUrl: 'https://linkedin.com/company/tesla-motors',
    website: 'https://www.tesla.com',
    industry: 'Automotive & Energy',
    size: '140,000+ employees',
    aliases: ['tsla'],
    isVerified: true,
    linkedinData: {
      description: 'Electric vehicle and clean energy company.',
      headquarters: 'Austin, TX, USA',
      employeeCount: '140,000+',
      founded: '2003'
    }
  },

  {
    name: 'spacex',
    displayName: 'SpaceX',
    logo: 'https://logo.clearbit.com/spacex.com',
    linkedinUrl: 'https://linkedin.com/company/spacex',
    website: 'https://www.spacex.com',
    industry: 'Aerospace',
    size: '13,000+ employees',
    aliases: ['space exploration technologies'],
    isVerified: true,
    linkedinData: {
      description: 'American aerospace manufacturer and space transport services company.',
      headquarters: 'Hawthorne, CA, USA',
      employeeCount: '13,000+',
      founded: '2002'
    }
  },

  // Financial Services & Investment Management
  {
    name: 'd e shaw',
    displayName: 'D. E. Shaw',
    logo: 'https://logo.clearbit.com/deshaw.com',
    linkedinUrl: 'https://linkedin.com/company/d-e-shaw-group',
    website: 'https://www.deshaw.com',
    industry: 'Investment Management',
    size: '1,000+ employees',
    aliases: ['shaw'],
    isVerified: true,
    linkedinData: {
      description: 'Global investment and technology development firm with offices around the world.',
      headquarters: 'New York, NY, USA',
      employeeCount: '1,000+',
      founded: '1988'
    }
  },

  {
    name: 'arcesium',
    displayName: 'Arcesium',
    logo: 'https://logo.clearbit.com/arcesium.com',
    linkedinUrl: 'https://linkedin.com/company/arcesium',
    website: 'https://www.arcesium.com',
    industry: 'Financial Technology',
    size: '1,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Technology company that provides sophisticated data management, analytics, and reporting services to investment management firms.',
      headquarters: 'New York, NY, USA',
      employeeCount: '1,000+',
      founded: '2015'
    }
  },

  {
    name: 'goldman sachs',
    displayName: 'Goldman Sachs',
    logo: 'https://logo.clearbit.com/goldmansachs.com',
    linkedinUrl: 'https://linkedin.com/company/goldman-sachs',
    website: 'https://www.goldmansachs.com',
    industry: 'Investment Banking',
    size: '45,000+ employees',
    aliases: ['gs', 'goldman'],
    isVerified: true,
    linkedinData: {
      description: 'Leading global investment banking, securities and investment management firm.',
      headquarters: 'New York, NY, USA',
      employeeCount: '45,000+',
      founded: '1869'
    }
  },

  {
    name: 'jp morgan chase',
    displayName: 'JP Morgan Chase',
    logo: 'https://logo.clearbit.com/jpmorganchase.com',
    linkedinUrl: 'https://linkedin.com/company/jpmorganchase',
    website: 'https://www.jpmorganchase.com',
    industry: 'Banking',
    size: '280,000+ employees',
    aliases: ['jpmorgan', 'jp morgan', 'chase', 'jpm'],
    isVerified: true,
    linkedinData: {
      description: 'Leading global financial services firm and one of the largest banking institutions in the United States.',
      headquarters: 'New York, NY, USA',
      employeeCount: '280,000+',
      founded: '2000'
    }
  },

  {
    name: 'morgan stanley',
    displayName: 'Morgan Stanley',
    logo: 'https://logo.clearbit.com/morganstanley.com',
    linkedinUrl: 'https://linkedin.com/company/morgan-stanley',
    website: 'https://www.morganstanley.com',
    industry: 'Investment Banking',
    size: '75,000+ employees',
    aliases: ['ms'],
    isVerified: true,
    linkedinData: {
      description: 'Leading global financial services firm providing investment banking, securities, wealth management and investment management services.',
      headquarters: 'New York, NY, USA',
      employeeCount: '75,000+',
      founded: '1935'
    }
  },

  {
    name: 'blackrock',
    displayName: 'BlackRock',
    logo: 'https://logo.clearbit.com/blackrock.com',
    linkedinUrl: 'https://linkedin.com/company/blackrock',
    website: 'https://www.blackrock.com',
    industry: 'Investment Management',
    size: '18,000+ employees',
    aliases: ['blk'],
    isVerified: true,
    linkedinData: {
      description: 'Global investment management corporation and the world\'s largest asset manager.',
      headquarters: 'New York, NY, USA',
      employeeCount: '18,000+',
      founded: '1988'
    }
  },

  {
    name: 'citadel',
    displayName: 'Citadel',
    logo: 'https://logo.clearbit.com/citadel.com',
    linkedinUrl: 'https://linkedin.com/company/citadel',
    website: 'https://www.citadel.com',
    industry: 'Investment Management',
    size: '4,000+ employees',
    aliases: ['citadel securities'],
    isVerified: true,
    linkedinData: {
      description: 'Global financial institution with investment and trading strategies across asset classes.',
      headquarters: 'Chicago, IL, USA',
      employeeCount: '4,000+',
      founded: '1990'
    }
  },

  {
    name: 'two sigma',
    displayName: 'Two Sigma',
    logo: 'https://logo.clearbit.com/twosigma.com',
    linkedinUrl: 'https://linkedin.com/company/two-sigma',
    website: 'https://www.twosigma.com',
    industry: 'Investment Management',
    size: '1,700+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Technology company that applies machine learning and distributed computing to investment management.',
      headquarters: 'New York, NY, USA',
      employeeCount: '1,700+',
      founded: '2001'
    }
  },

  // Indian Tech Giants
  {
    name: 'tata consultancy services',
    displayName: 'Tata Consultancy Services',
    logo: 'https://logo.clearbit.com/tcs.com',
    linkedinUrl: 'https://linkedin.com/company/tata-consultancy-services',
    website: 'https://www.tcs.com',
    industry: 'IT Services',
    size: '600,000+ employees',
    aliases: ['tcs'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational information technology services and consulting company.',
      headquarters: 'Mumbai, India',
      employeeCount: '600,000+',
      founded: '1968'
    }
  },

  {
    name: 'infosys',
    displayName: 'Infosys',
    logo: 'https://logo.clearbit.com/infosys.com',
    linkedinUrl: 'https://linkedin.com/company/infosys',
    website: 'https://www.infosys.com',
    industry: 'IT Services',
    size: '340,000+ employees',
    aliases: ['infy'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
      headquarters: 'Bangalore, India',
      employeeCount: '340,000+',
      founded: '1981'
    }
  },

  {
    name: 'wipro',
    displayName: 'Wipro',
    logo: 'https://logo.clearbit.com/wipro.com',
    linkedinUrl: 'https://linkedin.com/company/wipro',
    website: 'https://www.wipro.com',
    industry: 'IT Services',
    size: '250,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational corporation that provides information technology, consulting and business process services.',
      headquarters: 'Bangalore, India',
      employeeCount: '250,000+',
      founded: '1945'
    }
  },

  {
    name: 'hcl technologies',
    displayName: 'HCL Technologies',
    logo: 'https://logo.clearbit.com/hcltech.com',
    linkedinUrl: 'https://linkedin.com/company/hcl-technologies',
    website: 'https://www.hcltech.com',
    industry: 'IT Services',
    size: '220,000+ employees',
    aliases: ['hcl'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational information technology services and consulting company.',
      headquarters: 'Noida, India',
      employeeCount: '220,000+',
      founded: '1976'
    }
  },

  {
    name: 'tech mahindra',
    displayName: 'Tech Mahindra',
    logo: 'https://logo.clearbit.com/techmahindra.com',
    linkedinUrl: 'https://linkedin.com/company/tech-mahindra',
    website: 'https://www.techmahindra.com',
    industry: 'IT Services',
    size: '150,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational information technology services and consulting company.',
      headquarters: 'Pune, India',
      employeeCount: '150,000+',
      founded: '1986'
    }
  },

  // Indian Startups & Unicorns
  {
    name: 'flipkart',
    displayName: 'Flipkart',
    logo: 'https://logo.clearbit.com/flipkart.com',
    linkedinUrl: 'https://linkedin.com/company/flipkart',
    website: 'https://www.flipkart.com',
    industry: 'E-commerce',
    size: '50,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian e-commerce company headquartered in Bangalore.',
      headquarters: 'Bangalore, India',
      employeeCount: '50,000+',
      founded: '2007'
    }
  },

  {
    name: 'paytm',
    displayName: 'Paytm',
    logo: 'https://logo.clearbit.com/paytm.com',
    linkedinUrl: 'https://linkedin.com/company/paytm',
    website: 'https://paytm.com',
    industry: 'Financial Technology',
    size: '26,000+ employees',
    aliases: ['one97 communications'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational financial technology company that specializes in digital payments and financial services.',
      headquarters: 'Noida, India',
      employeeCount: '26,000+',
      founded: '2010'
    }
  },

  {
    name: 'ola',
    displayName: 'Ola',
    logo: 'https://logo.clearbit.com/olacabs.com',
    linkedinUrl: 'https://linkedin.com/company/ola-cabs',
    website: 'https://www.olacabs.com',
    industry: 'Transportation',
    size: '5,000+ employees',
    aliases: ['ola cabs', 'ani technologies'],
    isVerified: true,
    linkedinData: {
      description: 'Indian ride-hailing company offering mobility services.',
      headquarters: 'Bangalore, India',
      employeeCount: '5,000+',
      founded: '2010'
    }
  },

  {
    name: 'swiggy',
    displayName: 'Swiggy',
    logo: 'https://logo.clearbit.com/swiggy.com',
    linkedinUrl: 'https://linkedin.com/company/swiggy',
    website: 'https://www.swiggy.com',
    industry: 'Food Delivery',
    size: '7,000+ employees',
    aliases: ['bundl technologies'],
    isVerified: true,
    linkedinData: {
      description: 'Indian online food ordering and delivery platform.',
      headquarters: 'Bangalore, India',
      employeeCount: '7,000+',
      founded: '2014'
    }
  },

  {
    name: 'zomato',
    displayName: 'Zomato',
    logo: 'https://logo.clearbit.com/zomato.com',
    linkedinUrl: 'https://linkedin.com/company/zomato',
    website: 'https://www.zomato.com',
    industry: 'Food Delivery',
    size: '5,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational restaurant aggregator and food delivery company.',
      headquarters: 'Gurugram, India',
      employeeCount: '5,000+',
      founded: '2008'
    }
  },

  {
    name: 'byju\'s',
    displayName: 'BYJU\'S',
    logo: 'https://logo.clearbit.com/byjus.com',
    linkedinUrl: 'https://linkedin.com/company/byjus',
    website: 'https://byjus.com',
    industry: 'EdTech',
    size: '50,000+ employees',
    aliases: ['think and learn'],
    isVerified: true,
    linkedinData: {
      description: 'Indian educational technology company and the creator of the learning app.',
      headquarters: 'Bangalore, India',
      employeeCount: '50,000+',
      founded: '2011'
    }
  },

  {
    name: 'razorpay',
    displayName: 'Razorpay',
    logo: 'https://logo.clearbit.com/razorpay.com',
    linkedinUrl: 'https://linkedin.com/company/razorpay',
    website: 'https://razorpay.com',
    industry: 'Financial Technology',
    size: '4,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian fintech company that provides payment gateway services to online businesses.',
      headquarters: 'Bangalore, India',
      employeeCount: '4,000+',
      founded: '2014'
    }
  },

  {
    name: 'phonepe',
    displayName: 'PhonePe',
    logo: 'https://logo.clearbit.com/phonepe.com',
    linkedinUrl: 'https://linkedin.com/company/phonepe',
    website: 'https://www.phonepe.com',
    industry: 'Financial Technology',
    size: '5,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian digital payments and financial technology company.',
      headquarters: 'Bangalore, India',
      employeeCount: '5,000+',
      founded: '2015'
    }
  },

  {
    name: 'myntra',
    displayName: 'Myntra',
    logo: 'https://logo.clearbit.com/myntra.com',
    linkedinUrl: 'https://linkedin.com/company/myntra',
    website: 'https://www.myntra.com',
    industry: 'E-commerce Fashion',
    size: '4,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian fashion e-commerce company.',
      headquarters: 'Bangalore, India',
      employeeCount: '4,000+',
      founded: '2007'
    }
  },

  {
    name: 'nykaa',
    displayName: 'Nykaa',
    logo: 'https://logo.clearbit.com/nykaa.com',
    linkedinUrl: 'https://linkedin.com/company/nykaa',
    website: 'https://www.nykaa.com',
    industry: 'E-commerce Beauty',
    size: '4,500+ employees',
    aliases: ['fss e-commerce ventures'],
    isVerified: true,
    linkedinData: {
      description: 'Indian e-commerce company that sells beauty, wellness and fashion products.',
      headquarters: 'Mumbai, India',
      employeeCount: '4,500+',
      founded: '2012'
    }
  },

  {
    name: 'freshworks',
    displayName: 'Freshworks',
    logo: 'https://logo.clearbit.com/freshworks.com',
    linkedinUrl: 'https://linkedin.com/company/freshworks-inc',
    website: 'https://www.freshworks.com',
    industry: 'Software',
    size: '5,000+ employees',
    aliases: ['freshdesk'],
    isVerified: true,
    linkedinData: {
      description: 'Customer experience software company that provides cloud-based customer service solutions.',
      headquarters: 'Chennai, India',
      employeeCount: '5,000+',
      founded: '2010'
    }
  },

  {
    name: 'zerodha',
    displayName: 'Zerodha',
    logo: 'https://logo.clearbit.com/zerodha.com',
    linkedinUrl: 'https://linkedin.com/company/zerodha',
    website: 'https://zerodha.com',
    industry: 'Financial Services',
    size: '1,300+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian financial services company that offers retail and institutional broking.',
      headquarters: 'Bangalore, India',
      employeeCount: '1,300+',
      founded: '2010'
    }
  },

  {
    name: 'cred',
    displayName: 'CRED',
    logo: 'https://logo.clearbit.com/cred.club',
    linkedinUrl: 'https://linkedin.com/company/cred-club',
    website: 'https://cred.club',
    industry: 'Financial Technology',
    size: '2,000+ employees',
    aliases: ['dreamplug technologies'],
    isVerified: true,
    linkedinData: {
      description: 'Indian fintech company that provides a credit card bill payment platform.',
      headquarters: 'Bangalore, India',
      employeeCount: '2,000+',
      founded: '2018'
    }
  },

  // Global Tech Companies
  {
    name: 'oracle',
    displayName: 'Oracle',
    logo: 'https://logo.clearbit.com/oracle.com',
    linkedinUrl: 'https://linkedin.com/company/oracle',
    website: 'https://www.oracle.com',
    industry: 'Database Software',
    size: '143,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'American multinational computer technology corporation that offers database software and technology.',
      headquarters: 'Austin, TX, USA',
      employeeCount: '143,000+',
      founded: '1977'
    }
  },

  {
    name: 'salesforce',
    displayName: 'Salesforce',
    logo: 'https://logo.clearbit.com/salesforce.com',
    linkedinUrl: 'https://linkedin.com/company/salesforce',
    website: 'https://www.salesforce.com',
    industry: 'Cloud Computing',
    size: '80,000+ employees',
    aliases: ['crm'],
    isVerified: true,
    linkedinData: {
      description: 'American cloud-based software company that provides customer relationship management service.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '80,000+',
      founded: '1999'
    }
  },

  {
    name: 'adobe',
    displayName: 'Adobe',
    logo: 'https://logo.clearbit.com/adobe.com',
    linkedinUrl: 'https://linkedin.com/company/adobe',
    website: 'https://www.adobe.com',
    industry: 'Software',
    size: '29,000+ employees',
    aliases: ['adbe'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational computer software company that provides creative and marketing software.',
      headquarters: 'San Jose, CA, USA',
      employeeCount: '29,000+',
      founded: '1982'
    }
  },

  {
    name: 'nvidia',
    displayName: 'NVIDIA',
    logo: 'https://logo.clearbit.com/nvidia.com',
    linkedinUrl: 'https://linkedin.com/company/nvidia',
    website: 'https://www.nvidia.com',
    industry: 'Semiconductors',
    size: '30,000+ employees',
    aliases: ['nvda'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational technology company that designs graphics processing units for gaming and professional markets.',
      headquarters: 'Santa Clara, CA, USA',
      employeeCount: '30,000+',
      founded: '1993'
    }
  },

  {
    name: 'intel',
    displayName: 'Intel',
    logo: 'https://logo.clearbit.com/intel.com',
    linkedinUrl: 'https://linkedin.com/company/intel',
    website: 'https://www.intel.com',
    industry: 'Semiconductors',
    size: '131,000+ employees',
    aliases: ['intc'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational corporation and technology company that designs and manufactures microprocessors.',
      headquarters: 'Santa Clara, CA, USA',
      employeeCount: '131,000+',
      founded: '1968'
    }
  },

  {
    name: 'amd',
    displayName: 'AMD',
    logo: 'https://logo.clearbit.com/amd.com',
    linkedinUrl: 'https://linkedin.com/company/amd',
    website: 'https://www.amd.com',
    industry: 'Semiconductors',
    size: '26,000+ employees',
    aliases: ['advanced micro devices'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational semiconductor company that develops computer processors.',
      headquarters: 'Santa Clara, CA, USA',
      employeeCount: '26,000+',
      founded: '1969'
    }
  },

  // AI & Machine Learning Companies
  {
    name: 'openai',
    displayName: 'OpenAI',
    logo: 'https://logo.clearbit.com/openai.com',
    linkedinUrl: 'https://linkedin.com/company/openai',
    website: 'https://www.openai.com',
    industry: 'Artificial Intelligence',
    size: '1,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'AI research and deployment company whose mission is to ensure that artificial general intelligence benefits all of humanity.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '1,000+',
      founded: '2015'
    }
  },

  {
    name: 'anthropic',
    displayName: 'Anthropic',
    logo: 'https://logo.clearbit.com/anthropic.com',
    linkedinUrl: 'https://linkedin.com/company/anthropic',
    website: 'https://www.anthropic.com',
    industry: 'Artificial Intelligence',
    size: '500+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'AI safety company that develops safe, beneficial, and understandable AI systems.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '500+',
      founded: '2021'
    }
  },

  {
    name: 'deepmind',
    displayName: 'DeepMind',
    logo: 'https://logo.clearbit.com/deepmind.com',
    linkedinUrl: 'https://linkedin.com/company/deepmind',
    website: 'https://www.deepmind.com',
    industry: 'Artificial Intelligence',
    size: '1,000+ employees',
    aliases: ['deepmind technologies'],
    isVerified: true,
    linkedinData: {
      description: 'British artificial intelligence subsidiary of Alphabet Inc.',
      headquarters: 'London, UK',
      employeeCount: '1,000+',
      founded: '2010'
    }
  },

  // Consulting & Professional Services
  {
    name: 'mckinsey',
    displayName: 'McKinsey & Company',
    logo: 'https://logo.clearbit.com/mckinsey.com',
    linkedinUrl: 'https://linkedin.com/company/mckinsey',
    website: 'https://www.mckinsey.com',
    industry: 'Management Consulting',
    size: '45,000+ employees',
    aliases: ['mckinsey and company'],
    isVerified: true,
    linkedinData: {
      description: 'American worldwide management consulting firm.',
      headquarters: 'New York, NY, USA',
      employeeCount: '45,000+',
      founded: '1926'
    }
  },

  {
    name: 'boston consulting group',
    displayName: 'Boston Consulting Group',
    logo: 'https://logo.clearbit.com/bcg.com',
    linkedinUrl: 'https://linkedin.com/company/boston-consulting-group',
    website: 'https://www.bcg.com',
    industry: 'Management Consulting',
    size: '25,000+ employees',
    aliases: ['bcg'],
    isVerified: true,
    linkedinData: {
      description: 'American global management consulting firm.',
      headquarters: 'Boston, MA, USA',
      employeeCount: '25,000+',
      founded: '1963'
    }
  },

  {
    name: 'bain',
    displayName: 'Bain & Company',
    logo: 'https://logo.clearbit.com/bain.com',
    linkedinUrl: 'https://linkedin.com/company/bain-and-company',
    website: 'https://www.bain.com',
    industry: 'Management Consulting',
    size: '15,000+ employees',
    aliases: ['bain and company'],
    isVerified: true,
    linkedinData: {
      description: 'American management consulting company.',
      headquarters: 'Boston, MA, USA',
      employeeCount: '15,000+',
      founded: '1973'
    }
  },

  {
    name: 'deloitte',
    displayName: 'Deloitte',
    logo: 'https://logo.clearbit.com/deloitte.com',
    linkedinUrl: 'https://linkedin.com/company/deloitte',
    website: 'https://www.deloitte.com',
    industry: 'Professional Services',
    size: '415,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'One of the Big Four accounting organizations and largest professional services network.',
      headquarters: 'London, UK',
      employeeCount: '415,000+',
      founded: '1845'
    }
  },

  {
    name: 'pwc',
    displayName: 'PwC',
    logo: 'https://logo.clearbit.com/pwc.com',
    linkedinUrl: 'https://linkedin.com/company/pwc',
    website: 'https://www.pwc.com',
    industry: 'Professional Services',
    size: '365,000+ employees',
    aliases: ['pricewaterhousecoopers'],
    isVerified: true,
    linkedinData: {
      description: 'Multinational professional services brand of firms, operating as partnerships under the PwC brand.',
      headquarters: 'London, UK',
      employeeCount: '365,000+',
      founded: '1849'
    }
  },

  {
    name: 'ey',
    displayName: 'EY',
    logo: 'https://logo.clearbit.com/ey.com',
    linkedinUrl: 'https://linkedin.com/company/ernstandyoung',
    website: 'https://www.ey.com',
    industry: 'Professional Services',
    size: '395,000+ employees',
    aliases: ['ernst and young'],
    isVerified: true,
    linkedinData: {
      description: 'Multinational professional services partnership and one of the Big Four accounting firms.',
      headquarters: 'London, UK',
      employeeCount: '395,000+',
      founded: '1989'
    }
  },

  {
    name: 'kpmg',
    displayName: 'KPMG',
    logo: 'https://logo.clearbit.com/kpmg.com',
    linkedinUrl: 'https://linkedin.com/company/kpmg',
    website: 'https://www.kpmg.com',
    industry: 'Professional Services',
    size: '273,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Professional services company and one of the Big Four accounting organizations.',
      headquarters: 'Amstelveen, Netherlands',
      employeeCount: '273,000+',
      founded: '1987'
    }
  },

  {
    name: 'accenture',
    displayName: 'Accenture',
    logo: 'https://logo.clearbit.com/accenture.com',
    linkedinUrl: 'https://linkedin.com/company/accenture',
    website: 'https://www.accenture.com',
    industry: 'Professional Services',
    size: '738,000+ employees',
    aliases: ['acn'],
    isVerified: true,
    linkedinData: {
      description: 'Multinational professional services company that provides consulting and processing services.',
      headquarters: 'Dublin, Ireland',
      employeeCount: '738,000+',
      founded: '1989'
    }
  },

  // Banking & Financial Services
  {
    name: 'wells fargo',
    displayName: 'Wells Fargo',
    logo: 'https://logo.clearbit.com/wellsfargo.com',
    linkedinUrl: 'https://linkedin.com/company/wells-fargo',
    website: 'https://www.wellsfargo.com',
    industry: 'Banking',
    size: '238,000+ employees',
    aliases: ['wfc'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational financial services company.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '238,000+',
      founded: '1852'
    }
  },

  {
    name: 'bank of america',
    displayName: 'Bank of America',
    logo: 'https://logo.clearbit.com/bankofamerica.com',
    linkedinUrl: 'https://linkedin.com/company/bank-of-america',
    website: 'https://www.bankofamerica.com',
    industry: 'Banking',
    size: '216,000+ employees',
    aliases: ['bac', 'bofa'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational investment bank and financial services holding company.',
      headquarters: 'Charlotte, NC, USA',
      employeeCount: '216,000+',
      founded: '1998'
    }
  },

  {
    name: 'citigroup',
    displayName: 'Citigroup',
    logo: 'https://logo.clearbit.com/citigroup.com',
    linkedinUrl: 'https://linkedin.com/company/citi',
    website: 'https://www.citigroup.com',
    industry: 'Banking',
    size: '240,000+ employees',
    aliases: ['citi', 'citibank'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational investment bank and financial services corporation.',
      headquarters: 'New York, NY, USA',
      employeeCount: '240,000+',
      founded: '1998'
    }
  },

  {
    name: 'american express',
    displayName: 'American Express',
    logo: 'https://logo.clearbit.com/americanexpress.com',
    linkedinUrl: 'https://linkedin.com/company/american-express',
    website: 'https://www.americanexpress.com',
    industry: 'Financial Services',
    size: '77,300+ employees',
    aliases: ['amex', 'axp'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational financial services corporation.',
      headquarters: 'New York, NY, USA',
      employeeCount: '77,300+',
      founded: '1850'
    }
  },

  {
    name: 'visa',
    displayName: 'Visa',
    logo: 'https://logo.clearbit.com/visa.com',
    linkedinUrl: 'https://linkedin.com/company/visa',
    website: 'https://www.visa.com',
    industry: 'Financial Services',
    size: '26,000+ employees',
    aliases: ['v'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational financial services corporation that facilitates electronic funds transfers.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '26,000+',
      founded: '1958'
    }
  },

  {
    name: 'mastercard',
    displayName: 'Mastercard',
    logo: 'https://logo.clearbit.com/mastercard.com',
    linkedinUrl: 'https://linkedin.com/company/mastercard',
    website: 'https://www.mastercard.com',
    industry: 'Financial Services',
    size: '33,000+ employees',
    aliases: ['ma'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational financial services corporation that processes payments between banks.',
      headquarters: 'Purchase, NY, USA',
      employeeCount: '33,000+',
      founded: '1966'
    }
  },

  {
    name: 'paypal',
    displayName: 'PayPal',
    logo: 'https://logo.clearbit.com/paypal.com',
    linkedinUrl: 'https://linkedin.com/company/paypal',
    website: 'https://www.paypal.com',
    industry: 'Financial Technology',
    size: '30,000+ employees',
    aliases: ['pypl'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational financial technology company that operates an online payments system.',
      headquarters: 'San Jose, CA, USA',
      employeeCount: '30,000+',
      founded: '1998'
    }
  },

  // Indian Banking & Financial Services
  {
    name: 'state bank of india',
    displayName: 'State Bank of India',
    logo: 'https://logo.clearbit.com/sbi.co.in',
    linkedinUrl: 'https://linkedin.com/company/state-bank-of-india',
    website: 'https://www.sbi.co.in',
    industry: 'Banking',
    size: '245,000+ employees',
    aliases: ['sbi'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational public sector bank and financial services statutory body.',
      headquarters: 'Mumbai, India',
      employeeCount: '245,000+',
      founded: '1955'
    }
  },

  {
    name: 'hdfc bank',
    displayName: 'HDFC Bank',
    logo: 'https://logo.clearbit.com/hdfcbank.com',
    linkedinUrl: 'https://linkedin.com/company/hdfc-bank',
    website: 'https://www.hdfcbank.com',
    industry: 'Banking',
    size: '177,000+ employees',
    aliases: ['hdfc'],
    isVerified: true,
    linkedinData: {
      description: 'Indian banking and financial services company.',
      headquarters: 'Mumbai, India',
      employeeCount: '177,000+',
      founded: '1994'
    }
  },

  {
    name: 'icici bank',
    displayName: 'ICICI Bank',
    logo: 'https://logo.clearbit.com/icicibank.com',
    linkedinUrl: 'https://linkedin.com/company/icici-bank',
    website: 'https://www.icicibank.com',
    industry: 'Banking',
    size: '120,000+ employees',
    aliases: ['icici'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational bank and financial services company.',
      headquarters: 'Mumbai, India',
      employeeCount: '120,000+',
      founded: '1994'
    }
  },

  {
    name: 'axis bank',
    displayName: 'Axis Bank',
    logo: 'https://logo.clearbit.com/axisbank.com',
    linkedinUrl: 'https://linkedin.com/company/axis-bank',
    website: 'https://www.axisbank.com',
    industry: 'Banking',
    size: '85,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian private sector bank offering comprehensive financial services.',
      headquarters: 'Mumbai, India',
      employeeCount: '85,000+',
      founded: '1993'
    }
  },

  // E-commerce & Retail
  {
    name: 'walmart',
    displayName: 'Walmart',
    logo: 'https://logo.clearbit.com/walmart.com',
    linkedinUrl: 'https://linkedin.com/company/walmart',
    website: 'https://www.walmart.com',
    industry: 'Retail',
    size: '2,300,000+ employees',
    aliases: ['wmt'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational retail corporation that operates a chain of hypermarkets.',
      headquarters: 'Bentonville, AR, USA',
      employeeCount: '2,300,000+',
      founded: '1962'
    }
  },

  {
    name: 'target',
    displayName: 'Target',
    logo: 'https://logo.clearbit.com/target.com',
    linkedinUrl: 'https://linkedin.com/company/target',
    website: 'https://www.target.com',
    industry: 'Retail',
    size: '400,000+ employees',
    aliases: ['tgt'],
    isVerified: true,
    linkedinData: {
      description: 'American big box department store chain.',
      headquarters: 'Minneapolis, MN, USA',
      employeeCount: '400,000+',
      founded: '1902'
    }
  },

  {
    name: 'shopify',
    displayName: 'Shopify',
    logo: 'https://logo.clearbit.com/shopify.com',
    linkedinUrl: 'https://linkedin.com/company/shopify',
    website: 'https://www.shopify.com',
    industry: 'E-commerce',
    size: '12,000+ employees',
    aliases: ['shop'],
    isVerified: true,
    linkedinData: {
      description: 'Canadian multinational e-commerce company that provides a commerce platform.',
      headquarters: 'Ottawa, Canada',
      employeeCount: '12,000+',
      founded: '2006'
    }
  },

  {
    name: 'etsy',
    displayName: 'Etsy',
    logo: 'https://logo.clearbit.com/etsy.com',
    linkedinUrl: 'https://linkedin.com/company/etsy',
    website: 'https://www.etsy.com',
    industry: 'E-commerce',
    size: '2,500+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'American e-commerce company focused on handmade or vintage items and craft supplies.',
      headquarters: 'Brooklyn, NY, USA',
      employeeCount: '2,500+',
      founded: '2005'
    }
  },

  // Telecommunications
  {
    name: 'verizon',
    displayName: 'Verizon',
    logo: 'https://logo.clearbit.com/verizon.com',
    linkedinUrl: 'https://linkedin.com/company/verizon',
    website: 'https://www.verizon.com',
    industry: 'Telecommunications',
    size: '117,100+ employees',
    aliases: ['vz'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational telecommunications conglomerate.',
      headquarters: 'New York, NY, USA',
      employeeCount: '117,100+',
      founded: '2000'
    }
  },

  {
    name: 'at&t',
    displayName: 'AT&T',
    logo: 'https://logo.clearbit.com/att.com',
    linkedinUrl: 'https://linkedin.com/company/att',
    website: 'https://www.att.com',
    industry: 'Telecommunications',
    size: '203,000+ employees',
    aliases: ['t'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational telecommunications holding company.',
      headquarters: 'Dallas, TX, USA',
      employeeCount: '203,000+',
      founded: '1983'
    }
  },

  {
    name: 't-mobile',
    displayName: 'T-Mobile',
    logo: 'https://logo.clearbit.com/t-mobile.com',
    linkedinUrl: 'https://linkedin.com/company/t-mobile',
    website: 'https://www.t-mobile.com',
    industry: 'Telecommunications',
    size: '75,000+ employees',
    aliases: ['tmus'],
    isVerified: true,
    linkedinData: {
      description: 'American wireless network operator.',
      headquarters: 'Bellevue, WA, USA',
      employeeCount: '75,000+',
      founded: '1994'
    }
  },

  // Indian Telecommunications
  {
    name: 'reliance jio',
    displayName: 'Reliance Jio',
    logo: 'https://logo.clearbit.com/jio.com',
    linkedinUrl: 'https://linkedin.com/company/reliance-jio',
    website: 'https://www.jio.com',
    industry: 'Telecommunications',
    size: '22,000+ employees',
    aliases: ['jio'],
    isVerified: true,
    linkedinData: {
      description: 'Indian telecommunications company that provides wireless services.',
      headquarters: 'Mumbai, India',
      employeeCount: '22,000+',
      founded: '2016'
    }
  },

  {
    name: 'bharti airtel',
    displayName: 'Bharti Airtel',
    logo: 'https://logo.clearbit.com/airtel.in',
    linkedinUrl: 'https://linkedin.com/company/bharti-airtel',
    website: 'https://www.airtel.in',
    industry: 'Telecommunications',
    size: '25,000+ employees',
    aliases: ['airtel'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational telecommunications services company.',
      headquarters: 'New Delhi, India',
      employeeCount: '25,000+',
      founded: '1995'
    }
  },

  // Media & Entertainment
  {
    name: 'disney',
    displayName: 'Disney',
    logo: 'https://logo.clearbit.com/disney.com',
    linkedinUrl: 'https://linkedin.com/company/the-walt-disney-company',
    website: 'https://www.disney.com',
    industry: 'Entertainment',
    size: '220,000+ employees',
    aliases: ['walt disney', 'dis'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational mass media and entertainment conglomerate.',
      headquarters: 'Burbank, CA, USA',
      employeeCount: '220,000+',
      founded: '1923'
    }
  },

  {
    name: 'warner bros discovery',
    displayName: 'Warner Bros Discovery',
    logo: 'https://logo.clearbit.com/wbd.com',
    linkedinUrl: 'https://linkedin.com/company/warner-bros-discovery',
    website: 'https://www.wbd.com',
    industry: 'Entertainment',
    size: '40,000+ employees',
    aliases: ['wbd'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational mass media and entertainment conglomerate.',
      headquarters: 'New York, NY, USA',
      employeeCount: '40,000+',
      founded: '2022'
    }
  },

  {
    name: 'spotify',
    displayName: 'Spotify',
    logo: 'https://logo.clearbit.com/spotify.com',
    linkedinUrl: 'https://linkedin.com/company/spotify',
    website: 'https://www.spotify.com',
    industry: 'Music Streaming',
    size: '9,000+ employees',
    aliases: ['spot'],
    isVerified: true,
    linkedinData: {
      description: 'Swedish audio streaming and media services provider.',
      headquarters: 'Stockholm, Sweden',
      employeeCount: '9,000+',
      founded: '2006'
    }
  },

  // Semiconductors & Hardware
  {
    name: 'tsmc',
    displayName: 'TSMC',
    logo: 'https://logo.clearbit.com/tsmc.com',
    linkedinUrl: 'https://linkedin.com/company/tsmc',
    website: 'https://www.tsmc.com',
    industry: 'Semiconductors',
    size: '76,000+ employees',
    aliases: ['taiwan semiconductor'],
    isVerified: true,
    linkedinData: {
      description: 'Taiwanese multinational semiconductor contract manufacturing and design company.',
      headquarters: 'Hsinchu, Taiwan',
      employeeCount: '76,000+',
      founded: '1987'
    }
  },

  {
    name: 'qualcomm',
    displayName: 'Qualcomm',
    logo: 'https://logo.clearbit.com/qualcomm.com',
    linkedinUrl: 'https://linkedin.com/company/qualcomm',
    website: 'https://www.qualcomm.com',
    industry: 'Semiconductors',
    size: '51,000+ employees',
    aliases: ['qcom'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational semiconductor and telecommunications equipment company.',
      headquarters: 'San Diego, CA, USA',
      employeeCount: '51,000+',
      founded: '1985'
    }
  },

  {
    name: 'broadcom',
    displayName: 'Broadcom',
    logo: 'https://logo.clearbit.com/broadcom.com',
    linkedinUrl: 'https://linkedin.com/company/broadcom',
    website: 'https://www.broadcom.com',
    industry: 'Semiconductors',
    size: '50,000+ employees',
    aliases: ['avgo'],
    isVerified: true,
    linkedinData: {
      description: 'American designer, developer, manufacturer and global supplier of semiconductor and infrastructure software products.',
      headquarters: 'San Jose, CA, USA',
      employeeCount: '50,000+',
      founded: '1991'
    }
  },

  {
    name: 'texas instruments',
    displayName: 'Texas Instruments',
    logo: 'https://logo.clearbit.com/ti.com',
    linkedinUrl: 'https://linkedin.com/company/texas-instruments',
    website: 'https://www.ti.com',
    industry: 'Semiconductors',
    size: '30,000+ employees',
    aliases: ['ti', 'txn'],
    isVerified: true,
    linkedinData: {
      description: 'American technology company that designs and manufactures semiconductors and various integrated circuits.',
      headquarters: 'Dallas, TX, USA',
      employeeCount: '30,000+',
      founded: '1930'
    }
  },

  {
    name: 'arm',
    displayName: 'ARM',
    logo: 'https://logo.clearbit.com/arm.com',
    linkedinUrl: 'https://linkedin.com/company/arm',
    website: 'https://www.arm.com',
    industry: 'Semiconductors',
    size: '7,500+ employees',
    aliases: ['arm holdings'],
    isVerified: true,
    linkedinData: {
      description: 'British multinational semiconductor and software design company.',
      headquarters: 'Cambridge, UK',
      employeeCount: '7,500+',
      founded: '1990'
    }
  },

  // Aerospace & Defense
  {
    name: 'boeing',
    displayName: 'Boeing',
    logo: 'https://logo.clearbit.com/boeing.com',
    linkedinUrl: 'https://linkedin.com/company/boeing',
    website: 'https://www.boeing.com',
    industry: 'Aerospace',
    size: '170,000+ employees',
    aliases: ['ba'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational corporation that designs, manufactures, and sells airplanes.',
      headquarters: 'Chicago, IL, USA',
      employeeCount: '170,000+',
      founded: '1916'
    }
  },

  {
    name: 'airbus',
    displayName: 'Airbus',
    logo: 'https://logo.clearbit.com/airbus.com',
    linkedinUrl: 'https://linkedin.com/company/airbus',
    website: 'https://www.airbus.com',
    industry: 'Aerospace',
    size: '134,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'European multinational aerospace corporation.',
      headquarters: 'Toulouse, France',
      employeeCount: '134,000+',
      founded: '1970'
    }
  },

  {
    name: 'lockheed martin',
    displayName: 'Lockheed Martin',
    logo: 'https://logo.clearbit.com/lockheedmartin.com',
    linkedinUrl: 'https://linkedin.com/company/lockheed-martin',
    website: 'https://www.lockheedmartin.com',
    industry: 'Aerospace & Defense',
    size: '116,000+ employees',
    aliases: ['lmt'],
    isVerified: true,
    linkedinData: {
      description: 'American aerospace, arms, defense, information security, and technology corporation.',
      headquarters: 'Bethesda, MD, USA',
      employeeCount: '116,000+',
      founded: '1995'
    }
  },

  // Automotive
  {
    name: 'toyota',
    displayName: 'Toyota',
    logo: 'https://logo.clearbit.com/toyota.com',
    linkedinUrl: 'https://linkedin.com/company/toyota',
    website: 'https://www.toyota.com',
    industry: 'Automotive',
    size: '375,000+ employees',
    aliases: ['toyota motor'],
    isVerified: true,
    linkedinData: {
      description: 'Japanese multinational automotive manufacturer.',
      headquarters: 'Toyota, Japan',
      employeeCount: '375,000+',
      founded: '1937'
    }
  },

  {
    name: 'ford',
    displayName: 'Ford',
    logo: 'https://logo.clearbit.com/ford.com',
    linkedinUrl: 'https://linkedin.com/company/ford-motor-company',
    website: 'https://www.ford.com',
    industry: 'Automotive',
    size: '190,000+ employees',
    aliases: ['ford motor company', 'f'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational automobile manufacturer.',
      headquarters: 'Dearborn, MI, USA',
      employeeCount: '190,000+',
      founded: '1903'
    }
  },

  {
    name: 'general motors',
    displayName: 'General Motors',
    logo: 'https://logo.clearbit.com/gm.com',
    linkedinUrl: 'https://linkedin.com/company/general-motors',
    website: 'https://www.gm.com',
    industry: 'Automotive',
    size: '163,000+ employees',
    aliases: ['gm'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational automotive manufacturing company.',
      headquarters: 'Detroit, MI, USA',
      employeeCount: '163,000+',
      founded: '1908'
    }
  },

  // Indian Automotive
  {
    name: 'tata motors',
    displayName: 'Tata Motors',
    logo: 'https://logo.clearbit.com/tatamotors.com',
    linkedinUrl: 'https://linkedin.com/company/tata-motors',
    website: 'https://www.tatamotors.com',
    industry: 'Automotive',
    size: '80,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational automotive manufacturing company.',
      headquarters: 'Mumbai, India',
      employeeCount: '80,000+',
      founded: '1945'
    }
  },

  {
    name: 'mahindra',
    displayName: 'Mahindra',
    logo: 'https://logo.clearbit.com/mahindra.com',
    linkedinUrl: 'https://linkedin.com/company/mahindra-group',
    website: 'https://www.mahindra.com',
    industry: 'Automotive',
    size: '260,000+ employees',
    aliases: ['mahindra group'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational conglomerate company with automotive manufacturing.',
      headquarters: 'Mumbai, India',
      employeeCount: '260,000+',
      founded: '1945'
    }
  },

  // Energy & Oil
  {
    name: 'exxonmobil',
    displayName: 'ExxonMobil',
    logo: 'https://logo.clearbit.com/exxonmobil.com',
    linkedinUrl: 'https://linkedin.com/company/exxonmobil',
    website: 'https://www.exxonmobil.com',
    industry: 'Oil & Gas',
    size: '62,000+ employees',
    aliases: ['exxon', 'xom'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational oil and gas corporation.',
      headquarters: 'Irving, TX, USA',
      employeeCount: '62,000+',
      founded: '1999'
    }
  },

  {
    name: 'chevron',
    displayName: 'Chevron',
    logo: 'https://logo.clearbit.com/chevron.com',
    linkedinUrl: 'https://linkedin.com/company/chevron',
    website: 'https://www.chevron.com',
    industry: 'Oil & Gas',
    size: '47,000+ employees',
    aliases: ['cvx'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational energy corporation.',
      headquarters: 'San Ramon, CA, USA',
      employeeCount: '47,000+',
      founded: '1879'
    }
  },

  {
    name: 'shell',
    displayName: 'Shell',
    logo: 'https://logo.clearbit.com/shell.com',
    linkedinUrl: 'https://linkedin.com/company/shell',
    website: 'https://www.shell.com',
    industry: 'Oil & Gas',
    size: '87,000+ employees',
    aliases: ['royal dutch shell'],
    isVerified: true,
    linkedinData: {
      description: 'British-Dutch multinational oil and gas company.',
      headquarters: 'London, UK',
      employeeCount: '87,000+',
      founded: '1907'
    }
  },

  // Indian Energy & Conglomerates
  {
    name: 'reliance industries',
    displayName: 'Reliance Industries',
    logo: 'https://logo.clearbit.com/ril.com',
    linkedinUrl: 'https://linkedin.com/company/reliance-industries',
    website: 'https://www.ril.com',
    industry: 'Conglomerate',
    size: '200,000+ employees',
    aliases: ['ril'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational conglomerate company with businesses across energy, petrochemicals, oil & gas, telecom and retail.',
      headquarters: 'Mumbai, India',
      employeeCount: '200,000+',
      founded: '1973'
    }
  },

  {
    name: 'adani group',
    displayName: 'Adani Group',
    logo: 'https://logo.clearbit.com/adani.com',
    linkedinUrl: 'https://linkedin.com/company/adani-group',
    website: 'https://www.adani.com',
    industry: 'Conglomerate',
    size: '45,000+ employees',
    aliases: ['adani'],
    isVerified: true,
    linkedinData: {
      description: 'Indian multinational conglomerate company with businesses in ports, power generation, coal trading, and more.',
      headquarters: 'Ahmedabad, India',
      employeeCount: '45,000+',
      founded: '1988'
    }
  },

  // More Indian Startups & Companies
  {
    name: 'ola electric',
    displayName: 'Ola Electric',
    logo: 'https://logo.clearbit.com/olaelectric.com',
    linkedinUrl: 'https://linkedin.com/company/ola-electric',
    website: 'https://www.olaelectric.com',
    industry: 'Electric Vehicles',
    size: '2,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian electric vehicle manufacturer focused on electric scooters and mobility solutions.',
      headquarters: 'Bangalore, India',
      employeeCount: '2,000+',
      founded: '2017'
    }
  },

  {
    name: 'byjus',
    displayName: 'BYJU\'S',
    logo: 'https://logo.clearbit.com/byjus.com',
    linkedinUrl: 'https://linkedin.com/company/byjus',
    website: 'https://byjus.com',
    industry: 'EdTech',
    size: '15,000+ employees',
    aliases: ['think and learn'],
    isVerified: true,
    linkedinData: {
      description: 'Indian educational technology company and creator of learning apps.',
      headquarters: 'Bangalore, India',
      employeeCount: '15,000+',
      founded: '2011'
    }
  },

  {
    name: 'unacademy',
    displayName: 'Unacademy',
    logo: 'https://logo.clearbit.com/unacademy.com',
    linkedinUrl: 'https://linkedin.com/company/unacademy',
    website: 'https://unacademy.com',
    industry: 'EdTech',
    size: '3,000+ employees',
    aliases: ['sorting hat technologies'],
    isVerified: true,
    linkedinData: {
      description: 'Indian online education technology company that provides online courses and learning platform.',
      headquarters: 'Bangalore, India',
      employeeCount: '3,000+',
      founded: '2015'
    }
  },

  {
    name: 'vedantu',
    displayName: 'Vedantu',
    logo: 'https://logo.clearbit.com/vedantu.com',
    linkedinUrl: 'https://linkedin.com/company/vedantu',
    website: 'https://www.vedantu.com',
    industry: 'EdTech',
    size: '6,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian online tutoring platform that provides personalized learning experiences.',
      headquarters: 'Bangalore, India',
      employeeCount: '6,000+',
      founded: '2011'
    }
  },

  {
    name: 'meesho',
    displayName: 'Meesho',
    logo: 'https://logo.clearbit.com/meesho.com',
    linkedinUrl: 'https://linkedin.com/company/meesho',
    website: 'https://www.meesho.com',
    industry: 'Social Commerce',
    size: '3,000+ employees',
    aliases: ['fashnear technologies'],
    isVerified: true,
    linkedinData: {
      description: 'Indian social commerce platform that enables individuals to start their online businesses.',
      headquarters: 'Bangalore, India',
      employeeCount: '3,000+',
      founded: '2015'
    }
  },

  {
    name: 'urban company',
    displayName: 'Urban Company',
    logo: 'https://logo.clearbit.com/urbancompany.com',
    linkedinUrl: 'https://linkedin.com/company/urbancompany',
    website: 'https://www.urbancompany.com',
    industry: 'On-demand Services',
    size: '25,000+ employees',
    aliases: ['urbanclap'],
    isVerified: true,
    linkedinData: {
      description: 'Indian on-demand home services platform that provides beauty services, repairs, and other home services.',
      headquarters: 'Gurugram, India',
      employeeCount: '25,000+',
      founded: '2014'
    }
  },

  {
    name: 'dream11',
    displayName: 'Dream11',
    logo: 'https://logo.clearbit.com/dream11.com',
    linkedinUrl: 'https://linkedin.com/company/dream11',
    website: 'https://www.dream11.com',
    industry: 'Fantasy Sports',
    size: '1,500+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian fantasy sports platform that allows users to play fantasy cricket, football, and other sports.',
      headquarters: 'Mumbai, India',
      employeeCount: '1,500+',
      founded: '2008'
    }
  },

  {
    name: 'policybazaar',
    displayName: 'PolicyBazaar',
    logo: 'https://logo.clearbit.com/policybazaar.com',
    linkedinUrl: 'https://linkedin.com/company/policybazaar',
    website: 'https://www.policybazaar.com',
    industry: 'InsurTech',
    size: '10,000+ employees',
    aliases: ['pb fintech'],
    isVerified: true,
    linkedinData: {
      description: 'Indian online insurance aggregator and comparison platform.',
      headquarters: 'Gurugram, India',
      employeeCount: '10,000+',
      founded: '2008'
    }
  },

  {
    name: 'lenskart',
    displayName: 'Lenskart',
    logo: 'https://logo.clearbit.com/lenskart.com',
    linkedinUrl: 'https://linkedin.com/company/lenskart',
    website: 'https://www.lenskart.com',
    industry: 'E-commerce Eyewear',
    size: '12,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'Indian eyewear retailer that sells prescription eyeglasses, sunglasses, and contact lenses.',
      headquarters: 'Faridabad, India',
      employeeCount: '12,000+',
      founded: '2010'
    }
  },

  // More Global Tech Companies
  {
    name: 'uber',
    displayName: 'Uber',
    logo: 'https://logo.clearbit.com/uber.com',
    linkedinUrl: 'https://linkedin.com/company/uber-com',
    website: 'https://www.uber.com',
    industry: 'Transportation',
    size: '32,800+ employees',
    aliases: ['uber technologies'],
    isVerified: true,
    linkedinData: {
      description: 'American mobility as a service provider offering ride-hailing, food delivery, and freight transport.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '32,800+',
      founded: '2009'
    }
  },

  {
    name: 'lyft',
    displayName: 'Lyft',
    logo: 'https://logo.clearbit.com/lyft.com',
    linkedinUrl: 'https://linkedin.com/company/lyft',
    website: 'https://www.lyft.com',
    industry: 'Transportation',
    size: '5,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'American company that develops, markets, and operates mobility as a service, ride-sharing, vehicles for hire, and food delivery.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '5,000+',
      founded: '2012'
    }
  },

  {
    name: 'airbnb',
    displayName: 'Airbnb',
    logo: 'https://logo.clearbit.com/airbnb.com',
    linkedinUrl: 'https://linkedin.com/company/airbnb',
    website: 'https://www.airbnb.com',
    industry: 'Hospitality',
    size: '6,800+ employees',
    aliases: ['abnb'],
    isVerified: true,
    linkedinData: {
      description: 'American company that operates an online marketplace for short-term homestays and experiences.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '6,800+',
      founded: '2008'
    }
  },

  {
    name: 'slack',
    displayName: 'Slack',
    logo: 'https://logo.clearbit.com/slack.com',
    linkedinUrl: 'https://linkedin.com/company/tiny-speck',
    website: 'https://slack.com',
    industry: 'Software',
    size: '2,500+ employees',
    aliases: ['slack technologies'],
    isVerified: true,
    linkedinData: {
      description: 'American international software company that develops a proprietary business communication platform.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '2,500+',
      founded: '2009'
    }
  },

  {
    name: 'zoom',
    displayName: 'Zoom',
    logo: 'https://logo.clearbit.com/zoom.us',
    linkedinUrl: 'https://linkedin.com/company/zoom',
    website: 'https://zoom.us',
    industry: 'Video Communications',
    size: '8,400+ employees',
    aliases: ['zoom video communications', 'zm'],
    isVerified: true,
    linkedinData: {
      description: 'American communications technology company that provides videotelephony and online chat services.',
      headquarters: 'San Jose, CA, USA',
      employeeCount: '8,400+',
      founded: '2011'
    }
  },

  {
    name: 'twitter',
    displayName: 'Twitter',
    logo: 'https://logo.clearbit.com/twitter.com',
    linkedinUrl: 'https://linkedin.com/company/twitter',
    website: 'https://twitter.com',
    industry: 'Social Media',
    size: '7,500+ employees',
    aliases: ['x'],
    isVerified: true,
    linkedinData: {
      description: 'American microblogging and social networking service.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '7,500+',
      founded: '2006'
    }
  },

  {
    name: 'pinterest',
    displayName: 'Pinterest',
    logo: 'https://logo.clearbit.com/pinterest.com',
    linkedinUrl: 'https://linkedin.com/company/pinterest',
    website: 'https://www.pinterest.com',
    industry: 'Social Media',
    size: '4,200+ employees',
    aliases: ['pins'],
    isVerified: true,
    linkedinData: {
      description: 'American image sharing and social media service designed to enable saving and discovery of information.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '4,200+',
      founded: '2010'
    }
  },

  {
    name: 'snapchat',
    displayName: 'Snapchat',
    logo: 'https://logo.clearbit.com/snapchat.com',
    linkedinUrl: 'https://linkedin.com/company/snapchat',
    website: 'https://www.snapchat.com',
    industry: 'Social Media',
    size: '5,600+ employees',
    aliases: ['snap inc', 'snap'],
    isVerified: true,
    linkedinData: {
      description: 'American multimedia instant messaging app and service developed by Snap Inc.',
      headquarters: 'Santa Monica, CA, USA',
      employeeCount: '5,600+',
      founded: '2011'
    }
  },

  {
    name: 'tiktok',
    displayName: 'TikTok',
    logo: 'https://logo.clearbit.com/tiktok.com',
    linkedinUrl: 'https://linkedin.com/company/tiktok',
    website: 'https://www.tiktok.com',
    industry: 'Social Media',
    size: '7,000+ employees',
    aliases: ['bytedance'],
    isVerified: true,
    linkedinData: {
      description: 'Chinese video-sharing social networking service owned by ByteDance.',
      headquarters: 'Beijing, China',
      employeeCount: '7,000+',
      founded: '2016'
    }
  },

  {
    name: 'linkedin',
    displayName: 'LinkedIn',
    logo: 'https://logo.clearbit.com/linkedin.com',
    linkedinUrl: 'https://linkedin.com/company/linkedin',
    website: 'https://www.linkedin.com',
    industry: 'Professional Networking',
    size: '20,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'American business and employment-oriented online service that operates via websites and mobile apps.',
      headquarters: 'Sunnyvale, CA, USA',
      employeeCount: '20,000+',
      founded: '2003'
    }
  },

  // Cybersecurity Companies
  {
    name: 'crowdstrike',
    displayName: 'CrowdStrike',
    logo: 'https://logo.clearbit.com/crowdstrike.com',
    linkedinUrl: 'https://linkedin.com/company/crowdstrike',
    website: 'https://www.crowdstrike.com',
    industry: 'Cybersecurity',
    size: '8,500+ employees',
    aliases: ['crwd'],
    isVerified: true,
    linkedinData: {
      description: 'American cybersecurity technology company that provides cloud workload and endpoint security.',
      headquarters: 'Austin, TX, USA',
      employeeCount: '8,500+',
      founded: '2011'
    }
  },

  {
    name: 'palo alto networks',
    displayName: 'Palo Alto Networks',
    logo: 'https://logo.clearbit.com/paloaltonetworks.com',
    linkedinUrl: 'https://linkedin.com/company/palo-alto-networks',
    website: 'https://www.paloaltonetworks.com',
    industry: 'Cybersecurity',
    size: '13,500+ employees',
    aliases: ['panw'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational cybersecurity company that provides a next-generation firewall.',
      headquarters: 'Santa Clara, CA, USA',
      employeeCount: '13,500+',
      founded: '2005'
    }
  },

  // Enterprise Software Companies
  {
    name: 'servicenow',
    displayName: 'ServiceNow',
    logo: 'https://logo.clearbit.com/servicenow.com',
    linkedinUrl: 'https://linkedin.com/company/servicenow',
    website: 'https://www.servicenow.com',
    industry: 'Enterprise Software',
    size: '22,000+ employees',
    aliases: ['now'],
    isVerified: true,
    linkedinData: {
      description: 'American software company that provides service management software as a service.',
      headquarters: 'Santa Clara, CA, USA',
      employeeCount: '22,000+',
      founded: '2003'
    }
  },

  {
    name: 'snowflake',
    displayName: 'Snowflake',
    logo: 'https://logo.clearbit.com/snowflake.com',
    linkedinUrl: 'https://linkedin.com/company/snowflake-computing',
    website: 'https://www.snowflake.com',
    industry: 'Cloud Computing',
    size: '6,800+ employees',
    aliases: ['snow'],
    isVerified: true,
    linkedinData: {
      description: 'American cloud-based data-warehousing company that provides a cloud computing-based data warehouse.',
      headquarters: 'Bozeman, MT, USA',
      employeeCount: '6,800+',
      founded: '2012'
    }
  },

  {
    name: 'databricks',
    displayName: 'Databricks',
    logo: 'https://logo.clearbit.com/databricks.com',
    linkedinUrl: 'https://linkedin.com/company/databricks',
    website: 'https://databricks.com',
    industry: 'Data Analytics',
    size: '6,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'American enterprise software company that develops a web-based platform for working with Spark.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '6,000+',
      founded: '2013'
    }
  },

  {
    name: 'palantir',
    displayName: 'Palantir',
    logo: 'https://logo.clearbit.com/palantir.com',
    linkedinUrl: 'https://linkedin.com/company/palantir-technologies',
    website: 'https://www.palantir.com',
    industry: 'Data Analytics',
    size: '4,500+ employees',
    aliases: ['pltr'],
    isVerified: true,
    linkedinData: {
      description: 'American software company that specializes in big data analytics.',
      headquarters: 'Denver, CO, USA',
      employeeCount: '4,500+',
      founded: '2003'
    }
  },

  // Cloud & Infrastructure
  {
    name: 'cloudflare',
    displayName: 'Cloudflare',
    logo: 'https://logo.clearbit.com/cloudflare.com',
    linkedinUrl: 'https://linkedin.com/company/cloudflare-inc-',
    website: 'https://www.cloudflare.com',
    industry: 'Cloud Computing',
    size: '4,000+ employees',
    aliases: ['net'],
    isVerified: true,
    linkedinData: {
      description: 'American web infrastructure and website security company that provides content delivery network services.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '4,000+',
      founded: '2009'
    }
  },

  {
    name: 'twilio',
    displayName: 'Twilio',
    logo: 'https://logo.clearbit.com/twilio.com',
    linkedinUrl: 'https://linkedin.com/company/twilio-inc-',
    website: 'https://www.twilio.com',
    industry: 'Cloud Communications',
    size: '10,000+ employees',
    aliases: ['twlo'],
    isVerified: true,
    linkedinData: {
      description: 'American cloud communications company that allows software developers to programmatically make and receive phone calls.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '10,000+',
      founded: '2008'
    }
  },

  // Gaming Companies
  {
    name: 'roblox',
    displayName: 'Roblox',
    logo: 'https://logo.clearbit.com/roblox.com',
    linkedinUrl: 'https://linkedin.com/company/roblox',
    website: 'https://www.roblox.com',
    industry: 'Gaming',
    size: '2,100+ employees',
    aliases: ['rblx'],
    isVerified: true,
    linkedinData: {
      description: 'American video game platform and game creation system that allows users to program games.',
      headquarters: 'San Mateo, CA, USA',
      employeeCount: '2,100+',
      founded: '2004'
    }
  },

  {
    name: 'unity',
    displayName: 'Unity',
    logo: 'https://logo.clearbit.com/unity.com',
    linkedinUrl: 'https://linkedin.com/company/unity-technologies',
    website: 'https://unity.com',
    industry: 'Gaming Software',
    size: '7,700+ employees',
    aliases: ['unity technologies', 'u'],
    isVerified: true,
    linkedinData: {
      description: 'American video game software development company that provides a real-time 3D development platform.',
      headquarters: 'San Francisco, CA, USA',
      employeeCount: '7,700+',
      founded: '2004'
    }
  },

  // Additional smaller companies from original list (cleaned up)
  {
    name: 'caterpillar',
    displayName: 'Caterpillar',
    logo: 'https://logo.clearbit.com/caterpillar.com',
    linkedinUrl: 'https://linkedin.com/company/caterpillar-inc',
    website: 'https://www.caterpillar.com',
    industry: 'Heavy Machinery',
    size: '110,000+ employees',
    aliases: ['cat'],
    isVerified: true,
    linkedinData: {
      description: 'American Fortune 100 corporation that designs, develops, engineers, manufactures, markets, and sells machinery.',
      headquarters: 'Peoria, IL, USA',
      employeeCount: '110,000+',
      founded: '1925'
    }
  },

  {
    name: 'bny mellon',
    displayName: 'BNY Mellon',
    logo: 'https://logo.clearbit.com/bnymellon.com',
    linkedinUrl: 'https://linkedin.com/company/bny-mellon',
    website: 'https://www.bnymellon.com',
    industry: 'Financial Services',
    size: '48,000+ employees',
    aliases: ['bank of new york mellon'],
    isVerified: true,
    linkedinData: {
      description: 'American worldwide banking and financial services holding company.',
      headquarters: 'New York, NY, USA',
      employeeCount: '48,000+',
      founded: '2007'
    }
  },

  {
    name: 'fidelity investments',
    displayName: 'Fidelity Investments',
    logo: 'https://logo.clearbit.com/fidelity.com',
    linkedinUrl: 'https://linkedin.com/company/fidelity-investments',
    website: 'https://www.fidelity.com',
    industry: 'Financial Services',
    size: '72,000+ employees',
    aliases: ['fidelity'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational financial services corporation.',
      headquarters: 'Boston, MA, USA',
      employeeCount: '72,000+',
      founded: '1946'
    }
  },

  {
    name: 'idfc first bank',
    displayName: 'IDFC First Bank',
    logo: 'https://logo.clearbit.com/idfcfirstbank.com',
    linkedinUrl: 'https://linkedin.com/company/idfc-first-bank',
    website: 'https://www.idfcfirstbank.com',
    industry: 'Banking',
    size: '25,000+ employees',
    aliases: ['idfc first', 'idfc'],
    isVerified: true,
    linkedinData: {
      description: 'Indian commercial bank offering retail banking, wholesale banking, and treasury services.',
      headquarters: 'Mumbai, India',
      employeeCount: '25,000+',
      founded: '2018'
    }
  },

  {
    name: 'societe generale',
    displayName: 'Societe Generale',
    logo: 'https://logo.clearbit.com/societegenerale.com',
    linkedinUrl: 'https://linkedin.com/company/societe-generale',
    website: 'https://www.societegenerale.com',
    industry: 'Banking',
    size: '133,000+ employees',
    aliases: ['socgen', 'sg'],
    isVerified: true,
    linkedinData: {
      description: 'French multinational investment bank and financial services company.',
      headquarters: 'Paris, France',
      employeeCount: '133,000+',
      founded: '1864'
    }
  },

  {
    name: 'arista networks',
    displayName: 'Arista Networks',
    logo: 'https://logo.clearbit.com/arista.com',
    linkedinUrl: 'https://linkedin.com/company/arista-networks-inc',
    website: 'https://www.arista.com',
    industry: 'Computer Networking',
    size: '3,900+ employees',
    aliases: ['arista', 'anet'],
    isVerified: true,
    linkedinData: {
      description: 'American computer networking company that designs and sells multilayer network switches.',
      headquarters: 'Santa Clara, CA, USA',
      employeeCount: '3,900+',
      founded: '2004'
    }
  },

  {
    name: 'cisco',
    displayName: 'Cisco',
    logo: 'https://logo.clearbit.com/cisco.com',
    linkedinUrl: 'https://linkedin.com/company/cisco',
    website: 'https://www.cisco.com',
    industry: 'Networking Hardware',
    size: '84,900+ employees',
    aliases: ['cisco systems', 'csco'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational technology conglomerate that develops, manufactures and sells networking hardware.',
      headquarters: 'San Jose, CA, USA',
      employeeCount: '84,900+',
      founded: '1984'
    }
  },

  {
    name: 'samsung',
    displayName: 'Samsung',
    logo: 'https://logo.clearbit.com/samsung.com',
    linkedinUrl: 'https://linkedin.com/company/samsung-electronics',
    website: 'https://www.samsung.com',
    industry: 'Electronics',
    size: '270,000+ employees',
    aliases: ['samsung electronics'],
    isVerified: true,
    linkedinData: {
      description: 'South Korean multinational electronics company specializing in consumer electronics and semiconductors.',
      headquarters: 'Suwon, South Korea',
      employeeCount: '270,000+',
      founded: '1969'
    }
  },

  {
    name: 'kla',
    displayName: 'KLA',
    logo: 'https://logo.clearbit.com/kla.com',
    linkedinUrl: 'https://linkedin.com/company/kla',
    website: 'https://www.kla.com',
    industry: 'Semiconductor Equipment',
    size: '14,000+ employees',
    aliases: ['kla tencor', 'klac'],
    isVerified: true,
    linkedinData: {
      description: 'American capital equipment company that provides process control and yield management solutions.',
      headquarters: 'Milpitas, CA, USA',
      employeeCount: '14,000+',
      founded: '1976'
    }
  },

  {
    name: 'sap',
    displayName: 'SAP',
    logo: 'https://logo.clearbit.com/sap.com',
    linkedinUrl: 'https://linkedin.com/company/sap',
    website: 'https://www.sap.com',
    industry: 'Enterprise Software',
    size: '112,000+ employees',
    aliases: [],
    isVerified: true,
    linkedinData: {
      description: 'German multinational software corporation that makes enterprise software to manage business operations.',
      headquarters: 'Walldorf, Germany',
      employeeCount: '112,000+',
      founded: '1972'
    }
  },

  {
    name: 'ibm',
    displayName: 'IBM',
    logo: 'https://logo.clearbit.com/ibm.com',
    linkedinUrl: 'https://linkedin.com/company/ibm',
    website: 'https://www.ibm.com',
    industry: 'Technology Services',
    size: '282,000+ employees',
    aliases: ['international business machines'],
    isVerified: true,
    linkedinData: {
      description: 'American multinational technology corporation that produces and sells computer hardware, middleware and software.',
      headquarters: 'Armonk, NY, USA',
      employeeCount: '282,000+',
      founded: '1911'
    }
  },

  {
    name: 'workday',
    displayName: 'Workday',
    logo: 'https://logo.clearbit.com/workday.com',
    linkedinUrl: 'https://linkedin.com/company/workday',
    website: 'https://www.workday.com',
    industry: 'Enterprise Software',
    size: '18,500+ employees',
    aliases: ['wday'],
    isVerified: true,
    linkedinData: {
      description: 'American on‑demand financial management and human capital management software vendor.',
      headquarters: 'Pleasanton, CA, USA',
      employeeCount: '18,500+',
      founded: '2005'
    }
  },

  // Missing companies from old.js file
  {
    name: 'ai drive',
    displayName: 'AI Drive',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/ai-drive',
    website: null,
    industry: 'Artificial Intelligence',
    size: '100+ employees',
    aliases: ['aidrive'],
    isVerified: false,
    linkedinData: {
      description: 'AI technology company focused on developing innovative artificial intelligence solutions.',
      headquarters: 'Coimbatore, India',
      employeeCount: '100+',
      founded: '2018'
    }
  },

  {
    name: 'meshdefend technologies',
    displayName: 'MeshDefend Technologies',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/meshdefend-technologies',
    website: null,
    industry: 'Cybersecurity',
    size: null,
    aliases: ['meshdefend'],
    isVerified: false,
    linkedinData: {
      description: 'Cybersecurity technology company providing advanced security solutions.',
      headquarters: 'Bangalore, India',
      employeeCount: null,
      founded: null
    }
  },

  {
    name: 'genworx',
    displayName: 'Genworx',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/genworx',
    website: null,
    industry: 'Software',
    size: null,
    aliases: [],
    isVerified: false,
    linkedinData: {
      description: 'Software development company providing custom technology solutions.',
      headquarters: 'Chennai, India',
      employeeCount: null,
      founded: null
    }
  },

  {
    name: 'psiog digital',
    displayName: 'PSIOG Digital',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/psiog-digital',
    website: null,
    industry: 'Digital Services',
    size: null,
    aliases: ['psiog'],
    isVerified: false,
    linkedinData: {
      description: 'Digital transformation and technology consulting company.',
      headquarters: 'Chennai, India',
      employeeCount: null,
      founded: null
    }
  },

  {
    name: 'foodhub software solutions',
    displayName: 'FOODHUB Software Solutions',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/foodhub-software',
    website: null,
    industry: 'Food Technology',
    size: null,
    aliases: ['foodhub'],
    isVerified: false,
    linkedinData: {
      description: 'Software solutions provider for the food and restaurant industry.',
      headquarters: 'Chennai, India',
      employeeCount: null,
      founded: null
    }
  },

  {
    name: 'anora instrumentation',
    displayName: 'Anora Instrumentation',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/anora-instrumentation',
    website: null,
    industry: 'Instrumentation',
    size: null,
    aliases: ['anora'],
    isVerified: false,
    linkedinData: {
      description: 'Instrumentation and measurement technology company.',
      headquarters: 'Chennai, India',
      employeeCount: null,
      founded: null
    }
  },

  {
    name: 'stgi technologies consulting',
    displayName: 'STGI Technologies Consulting',
    logo: null,
    linkedinUrl: 'https://linkedin.com/company/stgi-technologies',
    website: null,
    industry: 'IT Consulting',
    size: null,
    aliases: ['stgi'],
    isVerified: false,
    linkedinData: {
      description: 'Technology consulting and software development company.',
      headquarters: 'Chandigarh, India',
      employeeCount: null,
      founded: null
    }
  },

  {
    name: 'linkedin corporation',
    displayName: 'LinkedIn Corporation',
    logo: 'https://logo.clearbit.com/linkedin.com',
    linkedinUrl: 'https://linkedin.com/company/linkedin',
    website: 'https://www.linkedin.com',
    industry: 'Professional Networking',
    size: '20,000+ employees',
    aliases: ['linkedin', 'linkedin corp', 'lnkd'],
    isVerified: true,
    linkedinData: {
      description: 'Professional networking platform that connects professionals worldwide.',
      headquarters: 'Sunnyvale, CA, USA',
      employeeCount: '20,000+',
      founded: '2003'
    }
  }
];

module.exports = companies;