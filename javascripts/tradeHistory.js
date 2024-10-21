(async () => {
    /**
     * Fetches recent trades data from GeckoTerminal and logs them to the console.
     */
    async function fetchRecentTrades() {
      let tradeEndpoint = 'https://api.geckoterminal.com/api/v2/networks/hedera-hashgraph/pools/0x6c241d9dea13214b43d198585ce214caf4d346df/trades';
      let poolEndpoint = 'https://api.geckoterminal.com/api/v2/networks/hedera-hashgraph/pools/0x6c241d9dea13214b43d198585ce214caf4d346df?include=base_token%2Cquote_token';
  
      try {
        // Fetch pool data
        const poolResponse = await fetch(poolEndpoint);
        if (!poolResponse.ok) {
          throw new Error(`HTTP error! Status: ${poolResponse.status}`);
        }
  
        const poolData = await poolResponse.json();
        const poolAttributes = poolData.data.attributes;
        console.log('Pool Information:');
        console.log(`24h Buys: ${poolAttributes.transactions.h24.buys}`);
        console.log(`24h Sells: ${poolAttributes.transactions.h24.sells}`);
        console.log(`24h Volume (USD): $${parseFloat(poolAttributes.volume_usd.h24).toFixed(2)}`);
        console.log(`Price Change Percentage (24h): ${poolAttributes.price_change_percentage.h24}%`);
        console.log(`Quote Token Price (USD): $${parseFloat(poolAttributes.quote_token_price_usd).toFixed(2)}`);
        console.log(`Base Token Price (USD): $${parseFloat(poolAttributes.base_token_price_usd).toFixed(7)}`);
        console.log('---------------------------------');
  
        // Fetch trades data
        const tradeResponse = await fetch(tradeEndpoint);
        if (!tradeResponse.ok) {
          throw new Error(`HTTP error! Status: ${tradeResponse.status}`);
        }
  
        const tradeData = await tradeResponse.json();
        const trades = tradeData.data;
  
        // Sort trades in ascending order by timestamp to process balance correctly
        trades.sort((a, b) => new Date(a.attributes.block_timestamp) - new Date(b.attributes.block_timestamp));
  
        const accountBalances = {}; // Track balances for each account
  
        for (const [index, trade] of trades.entries()) {
          const attributes = trade.attributes;
  
          const fromAddressUrl = `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${attributes.tx_from_address}`;
          let hederaAccount = attributes.tx_from_address;
          try {
            const addressResponse = await fetch(fromAddressUrl);
            if (addressResponse.ok) {
              const addressData = await addressResponse.json();
              hederaAccount = addressData.account;
            }
          } catch (addressError) {
            console.error('Error fetching Hedera account:', addressError);
          }
  
          // Fetch Twitter Handle from accountId
          const userEndpoint = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/${hederaAccount}`;
          let twitterHandle = 'Unknown';
          try {
            const userResponse = await fetch(userEndpoint);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              twitterHandle = userData.twitterHandle || 'Unknown';
            }
          } catch (userError) {
            console.error('Error fetching Twitter handle:', userError);
          }
  
          // Initialize HBARK balance if not already tracked
          if (!(hederaAccount in accountBalances)) {
            const balanceEndpoint = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.5022567/balances?account.id=${hederaAccount}`;
            try {
              const balanceResponse = await fetch(balanceEndpoint);
              if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                accountBalances[hederaAccount] = balanceData.balances.length > 0 ? balanceData.balances[0].balance : 0;
              } else {
                accountBalances[hederaAccount] = 0;
              }
            } catch (balanceError) {
              console.error('Error fetching HBARK balance:', balanceError);
              accountBalances[hederaAccount] = 0;
            }
          }
  
          let fromTokenId = attributes.from_token_address;
          let toTokenId = attributes.to_token_address;
  
          if (fromTokenId === '0x0000000000000000000000000000000000163b5a') fromTokenId = 'HBAR';
          if (fromTokenId === '0x00000000000000000000000000000000004ca367') fromTokenId = 'HBARK';
          if (toTokenId === '0x0000000000000000000000000000000000163b5a') toTokenId = 'HBAR';
          if (toTokenId === '0x00000000000000000000000000000000004ca367') toTokenId = 'HBARK';
  
          let tradeType = attributes.kind.toUpperCase();
  
          const fromTokenAmountRounded = Math.round(attributes.from_token_amount);
          const toTokenAmountRounded = Math.round(attributes.to_token_amount);
  
          let fromTokenValueUSD = fromTokenAmountRounded * attributes.price_from_in_usd;
          let toTokenValueUSD = toTokenAmountRounded * attributes.price_to_in_usd;
  
          if (fromTokenId === 'HBARK') {
            fromTokenValueUSD = fromTokenValueUSD.toFixed(7);
          } else {
            fromTokenValueUSD = fromTokenValueUSD.toFixed(2);
          }
  
          if (toTokenId === 'HBARK') {
            toTokenValueUSD = toTokenValueUSD.toFixed(7);
          } else {
            toTokenValueUSD = toTokenValueUSD.toFixed(2);
          }
  
          console.log(`Trade ${index + 1}`);
          console.log(`Timestamp: ${attributes.block_timestamp}`);
          console.log(`Transaction Hash: ${attributes.tx_hash}`);
          console.log(`From Address: ${hederaAccount}`);
          console.log(`Twitter: ${twitterHandle}`);
          console.log(`Current HBARK Balance: ${accountBalances[hederaAccount]}`);
          console.log(`From Token Amount: ${fromTokenAmountRounded}`);
          console.log(`From Token ID: ${fromTokenId}`);
          console.log(`Price From (in USD): $${parseFloat(attributes.price_from_in_usd).toFixed(7)}`);
          console.log(`Total From Token Value (in USD): $${fromTokenValueUSD}`);
          console.log(`To Token Amount: ${toTokenAmountRounded}`);
          console.log(`To Token ID: ${toTokenId}`);
          console.log(`Price To (in USD): $${parseFloat(attributes.price_to_in_usd).toFixed(7)}`);
          console.log(`Total To Token Value (in USD): $${toTokenValueUSD}`);
          console.log(`Trade Type: ${tradeType}`);
          console.log('---------------------------------');
        }
      } catch (error) {
        console.error('Error fetching trades or pool data:', error);
      }
    }
  
    await fetchRecentTrades();
  })();
  