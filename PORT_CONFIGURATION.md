# Port Configuration

## Services and Their Ports

### Backend
- **Port**: 3000
- **URL**: http://localhost:3000/api
- Serves both customer and merchant frontends

### Customer Frontend (Expo)
- **Metro Bundler**: 19000
- **Web**: 19006
- **Start Command**: `npm run customer` or `cd customer_frontend && npm start`

### Merchant Frontend (Expo)
- **Metro Bundler**: 19001
- **Web**: 19007
- **Start Command**: `npm run merchant` or `cd merchant_frontend && npm start`

## Running the Applications

### Run Everything Together
```bash
npm run dev
```

### Run Individual Services
```bash
# Backend only
npm run backend

# Customer app only
npm run customer

# Merchant app only
npm run merchant
```

### Web Development
```bash
# Run all web versions together
npm run dev:web

# Or individually
cd customer_frontend && npm run web  # Runs on port 19006
cd merchant_frontend && npm run web  # Runs on port 19007
```

## Notes
- Both frontends connect to the same backend API on port 3000
- The shared folder contains common code used by both frontends
- Make sure no other services are using these ports before starting