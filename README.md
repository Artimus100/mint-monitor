Pump Mint Monitor
Pump Mint Monitor is a TypeScript-based application designed to monitor and detect new token mints on the Pump program using the Yellowstone Geyser GRPC service. It subscribes to real-time transaction data, processes relevant mint events, and logs the details for further use or analysis.
Features

Real-time Monitoring: Subscribes to transaction streams from the Yellowstone Geyser GRPC service to capture new token mints on the Pump program.
Data Processing: Parses and formats transaction data, including token metadata and account details.
IPFS Integration: Fetches token metadata from IPFS gateways for complete token information.
Modular Design: Organized into separate modules for configuration, client management, data handling, and utilities.

Technologies Used

TypeScript: Ensures type safety and modern JavaScript features.
@triton-one/yellowstone-grpc: Interacts with the Yellowstone Geyser GRPC service for real-time data.
@grpc/grpc-js: Manages GRPC streams for subscription and data handling.
@solana/web3.js: Handles Solana-specific data types like public keys.
bs58: Provides base58 encoding and decoding for Solana addresses.
dotenv: Manages environment variables for secure configuration.
axios: Makes HTTP requests to fetch metadata from IPFS gateways.

Setup Instructions

Clone the Repository:
git clone https://github.com/Artimus100/pump-mint-monitor.git
cd pump-mint-monitor


Install Dependencies:
npm install


Set Up Environment Variables:

Create a .env file in the root directory:ENDPOINT=your_yellowstone_grpc_endpoint_here
TOKEN=your_token_here_if_using_private_endpoint


Obtain the ENDPOINT and TOKEN by signing up at Triton One. The ENDPOINT is typically grpc.triton.one:443, and the TOKEN is your API key.


Optional JSON Files:

Place pump-fun.json, token.json, and tokens1.json in the data/ directory if needed. If not provided, initialize tokens1.json as an empty object {}.


Run the Project:
npx ts-node src/main.ts



How It Works

config.ts: Loads environment variables and defines constants like the Pump program ID and instruction discriminators.
client.ts: Establishes the GRPC client connection and subscribes to the transaction stream using the specified filters.
dataHandler.ts: Processes incoming transaction data, checks for new mint events, and logs formatted details.
utils.ts: Provides helper functions for tasks like converting signatures and matching instruction discriminators.
main.ts: Orchestrates the application by setting up the client, subscribing to the stream, and handling events.

Project Name
The project is named Pump Mint Monitor, which clearly reflects its purpose: monitoring and detecting new token mints on the Pump program.