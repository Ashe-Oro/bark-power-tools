/**
 * DefiApi Class
 * Handles API interactions related to the DeFi Module
 */
class DefiApi {
    /**
     * Fetch DeFi Pool Data from GeckoTerminal API
     * @param {string} poolAddress - The address of the DeFi pool.
     * @returns {Promise<Object>} - The fetched DeFi pool data.
     */
    static async fetchDefiPoolData(poolAddress) {
        const url = `https://api.geckoterminal.com/api/v2/networks/hedera-hashgraph/pools/${poolAddress}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch DeFi pool data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}

/**
 * DefiView Class
 * Manages the presentation of DeFi data in the UI
 */
class DefiView {
    /**
     * Sanitizes input to prevent XSS or other issues by removing harmful characters.
     * @param {string} input - The string to sanitize.
     * @returns {string} - The sanitized string.
     */
    static sanitizeInput(input) {
        return input.replace(/[<>\/]/g, ''); // Strip harmful characters
    }

    /**
     * Formats a number with commas and specified decimal places.
     * @param {number} number - The number to format.
     * @param {number} decimalPlaces - The number of decimal places.
     * @returns {string} - The formatted number as a string.
     */
    static formatNumber(number, decimalPlaces) {
        if (isNaN(number)) {
            return 'N/A';
        }
        return number.toLocaleString('en-US', { 
            minimumFractionDigits: decimalPlaces, 
            maximumFractionDigits: decimalPlaces 
        });
    }

    /**
     * Strips the 'hedera-hashgraph_' prefix from token IDs and returns only the contract address.
     * @param {string} tokenId - The token ID from the API.
     * @returns {string} - The contract address without the 'hedera-hashgraph_' prefix.
     */
    static stripPrefix(tokenId) {
        return tokenId.replace('hedera-hashgraph_', ''); // Removes 'hedera-hashgraph_' prefix
    }

    /**
     * Display DeFi Pool Data in the UI
     * @param {Object} defiData - The DeFi pool data to display.
     */
    static displayDefiData(defiData) {
        const defiContainer = document.getElementById('defiData');
        if (!defiContainer) {
            console.error('DeFi Data container not found.');
            return;
        }

        // Clear existing data
        defiContainer.innerHTML = '';

        if (!defiData || !defiData.data || !defiData.data.attributes) {
            defiContainer.innerHTML = '<p>No DeFi data available.</p>';
            defiContainer.style.display = 'block';
            return;
        }

        const attributes = defiData.data.attributes;

        // Parse and format numbers using the new formatNumber method
        const baseTokenPrice = parseFloat(attributes.base_token_price_usd);
        const formattedBaseTokenPrice = DefiView.formatNumber(baseTokenPrice, 7);

        const quoteTokenPrice = parseFloat(attributes.quote_token_price_usd);
        const formattedQuoteTokenPrice = DefiView.formatNumber(quoteTokenPrice, 4);

        const baseTokenPriceQuoteToken = parseFloat(attributes.base_token_price_quote_token);
        const formattedBaseTokenPriceQuoteToken = DefiView.formatNumber(baseTokenPriceQuoteToken, 8);

        const quoteTokenPriceBaseToken = parseFloat(attributes.quote_token_price_base_token);
        const formattedQuoteTokenPriceBaseToken = DefiView.formatNumber(quoteTokenPriceBaseToken, 2);

        const marketCap = parseFloat(attributes.market_cap_usd);
        const formattedMarketCap = marketCap ? DefiView.formatNumber(marketCap, 2) : 'N/A';

        const volume24h = parseFloat(attributes.volume_usd.h24);
        const formattedVolume24h = DefiView.formatNumber(volume24h, 0);

        const reserveUSD = parseFloat(attributes.reserve_in_usd);
        const formattedReserveUSD = DefiView.formatNumber(reserveUSD, 0);

        // Strip 'hedera-hashgraph_' prefix from token IDs
        const baseTokenId = DefiView.stripPrefix(defiData.data.relationships.base_token.data.id);
        const quoteTokenId = DefiView.stripPrefix(defiData.data.relationships.quote_token.data.id);

        // Create HTML content with formatted data
        const content = `
        <p><strong>Pool Name:</strong> ${DefiView.sanitizeInput(attributes.name)}</p>
        <p><strong>$hbark Token Price (USD):</strong> $${formattedBaseTokenPrice}</p>
        <p><strong>$hbar Token Price (USD):</strong> $${formattedQuoteTokenPrice}</p>
        <p><strong>1 $hbark = </strong> ${formattedBaseTokenPriceQuoteToken} $hbar</p>
        <p><strong>1 $hbar = </strong> ${formattedQuoteTokenPriceBaseToken} $hbark</p>
        <p><strong>Fully Diluted Valuation (USD):</strong> $${DefiView.formatNumber(parseFloat(attributes.fdv_usd), 0)}</p>
        <p><strong>Current Market Cap (USD):</strong> $${DefiView.formatNumber(parseFloat(attributes.fdv_usd), 0)}</p>
        <p><strong>Total Supply: </strong> 420,000,000</p>
        <p> <strong>MAX Supply: </strong> 420,000,000</p>
        <p><strong>Price Change (24h):</strong> ${attributes.price_change_percentage.h24}%</p>
        <p><strong>Volume (24h USD):</strong> $${formattedVolume24h}</p>
        <p><strong>Liquidity (USD):</strong> $${formattedReserveUSD}</p>
        <p><strong>Transactions (24h):</strong> ${attributes.transactions.h24.buys} Buys, ${attributes.transactions.h24.sells} Sells</p>
        
        <p><strong>Swap on DEX: </strong>
        <a href="https://www.saucerswap.finance/swap/HBAR/0.0.5022567" target="_blank" style="color: #0000EE;">
        ${DefiView.sanitizeInput(defiData.data.relationships.dex.data.id)}</a></p>
        
        <p><strong>Base Token: $HBARK </strong><br />
        &nbsp;&nbsp;&nbsp;<strong>TokenID: </strong>
        <a href="https://hashscan.io/mainnet/token/0.0.5022567" target="_blank" style="color: #0000EE;">0.0.5022567</a><br />
        &nbsp;&nbsp;&nbsp;<strong>Token Contract Address: </strong>
        <a href="https://hashscan.io/mainnet/token/${baseTokenId}" target="_blank" style="color: #0000EE;">${baseTokenId}</a></p>
    
        <p><strong>Base Token: $WHBAR </strong><br />
        &nbsp;&nbsp;&nbsp;<strong>TokenID: </strong>
        <a href="https://hashscan.io/mainnet/token/0.0.1456986" target="_blank" style="color: #0000EE;">0.0.1456986</a><br />
        &nbsp;&nbsp;&nbsp;<strong>Token Contract Address: </strong>
        <a href="https://hashscan.io/mainnet/token/${baseTokenId}" target="_blank" style="color: #0000EE;">${baseTokenId}</a></p>
    `;
    

        defiContainer.innerHTML = content;
        defiContainer.style.display = 'block';
    }


    /**
     * Show the global loader
     */
    static showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'block';
        }
    }

    /**
     * Hide the global loader
     */
    static hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Display Error Message for DeFi Module
     * @param {Error} error - The error object.
     */
    static displayDefiError(error) {
        const defiContainer = document.getElementById('defiData');
        if (!defiContainer) {
            console.error('DeFi Data container not found.');
            return;
        }

        defiContainer.innerHTML = `<p class="error">Failed to load DeFi data: ${BarkUtils.sanitizeInput(error.message)}</p>`;
        defiContainer.style.display = 'block';
    }
}


/**
 * DefiManager Class
 * Orchestrates the fetching and displaying of DeFi data
 */
class DefiManager {
    /**
     * Handle Fetching and Displaying DeFi Data
     * @param {string} poolAddress - The address of the DeFi pool.
     */
    static async fetchAndDisplayDefiData(poolAddress) {
        try {
            // Show loader
            DefiView.showLoader();

            // Fetch DeFi data
            const defiData = await DefiApi.fetchDefiPoolData(poolAddress);

            // Render DeFi data
            DefiView.displayDefiData(defiData);
        } catch (error) {
            console.error('Error fetching DeFi data:', error);
            DefiView.displayDefiError(error);
        } finally {
            // Hide loader
            DefiView.hideLoader();
        }
    }
}

// Event Listener for the DeFi Module Fetch Button
const fetchDefiDataButton = document.getElementById('fetchDefiDataButton');
if (fetchDefiDataButton) {
    fetchDefiDataButton.addEventListener('click', () => {
        const poolAddress = '0x6c241d9dea13214b43d198585ce214caf4d346df'; // Provided pool address
        DefiManager.fetchAndDisplayDefiData(poolAddress);
    });
}
