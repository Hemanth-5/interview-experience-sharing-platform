# LinkedIn API Configuration Guide

## Current Status
Your system is showing "LinkedIn API key not configured, using fallback" because no API key is set. The system currently uses mock data for testing.

## Configuration Options

### Option 1: LinkedIn Data API via RapidAPI (Recommended - Working)

**API Provider:** [LinkedIn Data API on RapidAPI](https://rapidapi.com/promptapi/api/linkedin-data-api/)
**Pros:** Real LinkedIn data, company search, affordable pricing
**Cons:** Rate limits based on plan

#### Setup Steps:
1. **Sign up for RapidAPI:**
   - Go to [LinkedIn Data API](https://rapidapi.com/promptapi/api/linkedin-data-api/)
   - Create account and subscribe to a plan (free tier available)

2. **Get your API key:**
   - After subscribing, copy your `X-RapidAPI-Key` from the dashboard
   - Test endpoint: `POST /companies/search`

3. **Update your .env file:**
   ```bash
   RAPIDAPI_KEY=your_actual_rapidapi_key_here
   LINKEDIN_API_URL=https://linkedin-data-api.p.rapidapi.com
   ```

4. **API Structure:**
   ```javascript
   // POST /companies/search
   {
     "keyword": "Google",
     "locations": [],
     "companySizes": [],
     "hasJobs": false,
     "industries": [],
     "page": 1
   }
   ```

4. **Restart your server:**
   ```bash
   cd server
   npm restart
   ```

#### Example API call structure:
```javascript
// The service will automatically use this format:
headers: {
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'linkedin-company-search.p.rapidapi.com'
}
```

### Option 2: Direct LinkedIn API (Enterprise/Partner access required)

**Pros:** Official LinkedIn data, comprehensive
**Cons:** Requires LinkedIn partnership, expensive, complex approval

#### Setup Steps:
1. **Apply for LinkedIn Partner Program:**
   - Must have a business use case
   - Go through LinkedIn's approval process
   - Get approved for Company Lookup API

2. **Get OAuth credentials:**
   - Set up LinkedIn App in Developer Console
   - Get Client ID and Client Secret

3. **Update your .env file:**
   ```bash
   LINKEDIN_API_KEY=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   LINKEDIN_API_URL=https://api.linkedin.com/v2
   ```

### Option 3: Alternative Services

#### Clearbit Company API
**Pros:** Good company data, easier approval
**Cons:** Limited LinkedIn-specific data

```bash
CLEARBIT_API_KEY=your_clearbit_key
LINKEDIN_API_URL=https://company.clearbit.com/v2
```

#### Crunchbase API
**Pros:** Startup and company data
**Cons:** Different data structure

```bash
CRUNCHBASE_API_KEY=your_crunchbase_key
LINKEDIN_API_URL=https://api.crunchbase.com/api/v4
```

## Testing Your Configuration

### 1. Check Environment Variables
```bash
# In your server directory
node -e "console.log('API Key:', process.env.RAPIDAPI_KEY ? 'Configured' : 'Not configured')"
```

### 2. Test the API endpoints
```bash
# Run the test script
node test-linkedin-integration.js
```

### 3. Check server logs
When you search for companies in the UI, check your server console. You should see:
- ✅ "LinkedIn API key configured" instead of "using fallback"
- ✅ Real API responses instead of mock data

## Current Mock Data (Fallback Mode)

The system currently includes mock data for these companies:
- Google
- Microsoft  
- Amazon
- Apple
- Meta

This allows you to test the full LinkedIn integration flow without an API key.

## Recommended Setup for Development

1. **Start with fallback mode** (current setup) - test the UI/UX
2. **Get RapidAPI key** for real LinkedIn data
3. **Consider LinkedIn API** only if you need official partnership

## Environment Variable Priority

The service checks for API keys in this order:
1. `LINKEDIN_API_KEY` (direct LinkedIn)
2. `RAPIDAPI_KEY` (RapidAPI service)
3. Falls back to mock data if neither is found

## Cost Considerations

### RapidAPI LinkedIn Company Search:
- **Free Tier:** ~100 requests/month
- **Basic Plan:** ~$10/month for 1,000 requests
- **Pro Plan:** ~$25/month for 10,000 requests

### Direct LinkedIn API:
- Requires business partnership
- Custom pricing based on usage
- Usually $1000+ monthly minimum

## Security Notes

### Environment Variables:
- Never commit `.env` file to git
- Use different keys for development/production
- Rotate keys regularly

### Rate Limiting:
The service includes built-in rate limiting and fallback logic to prevent API quota exhaustion.

## Next Steps

1. **For immediate testing:** Use current fallback mode
2. **For production:** Get RapidAPI key and update `.env`
3. **For enterprise:** Apply for LinkedIn Partner Program

The LinkedIn integration is designed to work seamlessly with any of these options!
