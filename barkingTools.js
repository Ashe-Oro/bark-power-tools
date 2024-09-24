// Global flag for toggling
let detailsVisible = false;

// Basic utility functions for sanitizing, formatting, and regex matching strings
class BarkUtils {
    static sanitizeTwitterHandle = (handle) => {
        // Remove the @ symbol if it exists
        return handle.replace(/^@/, '');
    };
    
    // Function to sanitize general input to prevent XSS or other issues
    static sanitizeInput = (input) => {
        return input.replace(/[<>\/]/g, ''); // Strip harmful characters
    };
    
    // Function to check if the input is a valid accountId in the format 0.0.xxxx
    static isAccountId = (input) => {
        // Regex to match the accountId format (e.g., 0.0.5225094)
        const accountIdRegex = /^0\.0\.\d+$/;
        return accountIdRegex.test(input);
    };
    
    // Function to format numbers with commas
    static formatNumber = (number) => {
        return number.toLocaleString('en-US'); // Formats number with commas for the US
    };
}

// Handles all API requests/responses for Barking Game players
class BarkApi {
    // Fetches the Barking Power leaderboard for a given number of players
    static async fetchBarkingPowerLeaderboard(num = 1000) {
        num = Math.max(1, num);

        const url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard/barkingPower/${num}`;
        let response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            await this.logError('Failed to fetch barking power leaderboard.', response);
            return null;
        }
    };

    // Fetches the Barks Received leaderboard for a given number of players
    static async fetchBarksReceviedLeaderboard(num = 1000) {
        num = Math.max(1, num);

        const url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard/${num}`
        let response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            await this.logError(`Failed to fetch barks received leaderboard.`, response);
            return null;
        }
    }

    // Fetches the player's bark token balance from Hedera
    static async fetchHederaBarkTokenBalance(accountId) {
        const url = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.5022567/balances?account.id=${accountId}`;
        let response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            await this.logError(`Failed to fetch bark token balance from Hedera for ${accountId}.`, response);
            return null;
        }
    };

    // Fetches available barking power for a player
    static async fetchBarkingPower(accountId) {
        const url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/${accountId}`;
        let response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            await this.logError(`Failed to fetch barking power for ${accountId}.`, response);
            return null;
        }
    }

    // Fetches user data for a player
    static async fetchUserData(accountId) {
        const url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/${accountId}`;
        let response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            await this.logError(`Failed to fetch user data for ${accountId}.`, response);
            return null;
        }
    }

    static async fetchTwitterData(accountId) {
        const url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/twitter/${accountId}`;
        let response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            await this.logError(`Failed to fetch Twitter user data for ${accountId}.`, response);
            return null;
        }
    }

    // Logs the error message from the response
    static async logError(message, response) {
        try {
            const errorMessage = await response.text();
            console.error(`${message}: ${errorMessage}`);
        } catch (e) {
            console.error(`${message}: Unable to parse error response.`, e);
        }
    }
}

// TODO: REFACTOR THE REST INTO CLASSES

async function checkBarkPower() {
    // Clear previous output and error messages
    document.getElementById("output").innerHTML = "";
    document.getElementById("error").innerHTML = "";

    // Hide elements only if they exist
    const toggleDetailsElement = document.getElementById("toggleDetails");
    if (toggleDetailsElement) {
        toggleDetailsElement.style.display = "none";
    }
    const progressContainerElement = document.getElementById("progressContainer");
    if (progressContainerElement) {
        progressContainerElement.style.display = "none";
    }
    // Hide elements only if they exist
    const clearSearchElement = document.getElementById("clearSearch");
    if (clearSearchElement) {
        clearSearchElement.style.display = "none";
    }
    const outputElement = document.getElementById("output");
    if (outputElement) {
        outputElement.style.display = "none";
    }

    // Get the user input (could be a Twitter handle or accountId)
    let userInput = document.getElementById('twitterHandle').value;

    // Sanitize the user input
    userInput = BarkUtils.sanitizeInput(userInput);

    // Check if the input is a Hedera account ID
    let isHederaAccount = BarkUtils.isAccountId(userInput);

    try {
        if (isHederaAccount) {
            // Hedera Account Logic Path
            const accountId = userInput;
            let accountLabel = "";

            console.log(`Processing Hedera Account ID: ${accountId}`);

            // Step 1: Fetch $hbark token balance
            console.log('Fetching $hbark token balance...');
            let balanceData = await BarkApi.fetchHederaBarkTokenBalance(accountId);

            let hbarkBalance = 0;
            if (balanceData.balances && balanceData.balances.length > 0) {
                hbarkBalance = balanceData.balances[0].balance;
                accountLabel = "Current $HBARK holder";
                console.log(`$hbark balance found: ${hbarkBalance}`);
            } else {
                hbarkBalance = 0;
                accountLabel = "Account does not currently hold $HBARK";
                console.log('No $hbark balance found.');
            }
            console.log(`Account Label after balance check: ${accountLabel}`);

            // Step 2: Fetch barking power from barking-power endpoint
            console.log('Fetching barking power data...');
            let barkingPowerData = await BarkApi.fetchBarkingPower(accountId);

            let barkPowerData = null;
            let userData = null;

            if (barkingPowerData.code === "HBARK_USER_NOT_FOUND") {
                console.log('No barking power data found for account.');
                // Account has not been allocated any Bark Power
                if (hbarkBalance === 0) {
                    accountLabel = "Account does not currently hold $HBARK and has not been allocated Bark Power";
                } else {
                    accountLabel = "$HBARK Holder, but has not been allocated Bark Power";
                }
                console.log(`Account Label after barking power check: ${accountLabel}`);

                // Display the balance and label without showing error messages
                displayBarkPowerData(null, accountLabel, null, hbarkBalance, accountId);
                return;
            } else {
                // Has held $hbark for at least one refill. Fetch barking power data
                console.log('Barking power data found.');
                barkPowerData = barkingPowerData;

                // Step 3: Attempt to fetch from users endpoint
                console.log('Fetching user data from users endpoint...');
                let userData = await BarkApi.fetchUserData(accountId);

                if (userData.code === "HBARK_USER_NOT_FOUND") {
                    userData = null;
                    accountLabel = "Holds $HBARK and has been refilled with Bark Power";
                    console.log('User data not found in users endpoint.');
                } else {
                    console.log('User data found.');
                    if (userData.signedTermMessage) {
                        accountLabel = "Signed Terms";
                    } else if (userData.twitterHandle) {
                        accountLabel = "Twitter Account Linked";
                    } else {
                        accountLabel = "Holds $HBARK and has been refilled with Bark Power";
                    }
                }
                console.log(`Account Label after user data check: ${accountLabel}`);

                // Pass hbarkBalance to display function
                displayBarkPowerData(barkPowerData, accountLabel, userData, hbarkBalance, accountId);
                return;
            }
        } else {
            // Twitter Handle Logic Path
            let twitterHandle = BarkUtils.sanitizeTwitterHandle(userInput);

            if (!twitterHandle) {
                document.getElementById('error').textContent = 'Please enter a valid Twitter handle.';
                return;
            }

            console.log(`Processing Twitter Handle: ${twitterHandle}`);

            // Step 1: Fetch from users/twitter endpoint
            console.log('Fetching user data from users/twitter endpoint...');
            let userData = await BarkApi.fetchTwitterData(twitterHandle);

            let accountLabel = "";
            let accountId = null;
            let hbarkBalance = 0;
            let barkPowerData = null;

            if (userData.code === "HBARK_USER_NOT_FOUND") {
                // User has not linked a Hedera account
                accountLabel = "Has not linked with Hedera Account";
                console.log('User has not linked a Hedera account.');

                // Fetch barksReceived from leaderboard
                console.log('Fetching barksReceived from leaderboard...');
                let leaderboardData = await BarkApi.fetchBarksReceviedLeaderboard();

                // Find the twitterHandle in the leaderboard data
                let found = false;
                for (let item of leaderboardData) {
                    if (item.twitterHandle && item.twitterHandle.toLowerCase() === twitterHandle.toLowerCase()) {
                        barkPowerData = {
                            barksReceived: item.barksReceived
                        };
                        found = true;
                        console.log('Twitter handle found in leaderboard.');
                        break;
                    }
                }

                if (!found) {
                    console.log('Twitter handle not found in leaderboard.');
                    document.getElementById('error').textContent = "No barks received for this Twitter handle.";
                    return;
                }

                displayBarkPowerData(barkPowerData, accountLabel, null, null, null);
                return;
            } else {
                // User data exists
                console.log('User data found for Twitter handle.');
                accountId = userData.accountId;

                // Check if the user has fully linked a Hedera account
                if (accountId && userData.isVerified && userData.signedTermMessage) {
                    accountLabel = "Fully linked account";
                    console.log('User has a fully linked account.');

                    // Fetch barking power data using accountId
                    console.log('Fetching barking power data using accountId...');
                    let barkingPowerData = await BarkApi.fetchBarkingPower(accountId);

                    barkPowerData = barkingPowerData;

                    // Fetch $hbark token balance
                    console.log('Fetching $hbark token balance using accountId...');
                    let balanceData = await BarkApi.fetchHederaBarkTokenBalance(accountId);

                    if (balanceData.balances && balanceData.balances.length > 0) {
                        hbarkBalance = balanceData.balances[0].balance;
                        console.log(`$hbark balance found: ${hbarkBalance}`);
                    } else {
                        hbarkBalance = 0;
                        console.log('No $hbark balance found.');
                    }

                    displayBarkPowerData(barkPowerData, accountLabel, userData, hbarkBalance, accountId);
                    return;
                } else {
                    // User has not fully linked a Hedera account
                    accountLabel = "Has not fully linked a Hedera Account";
                    console.log('User has not fully linked a Hedera account.');

                    // Fetch barksReceived from leaderboard
                    console.log('Fetching barksReceived from leaderboard...');
                    let leaderboardData = await BarkApi.fetchBarksReceviedLeaderboard(1000);

                    // Find the twitterHandle in the leaderboard data
                    let found = false;
                    for (let item of leaderboardData) {
                        if (item.twitterHandle && item.twitterHandle.toLowerCase() === twitterHandle.toLowerCase()) {
                            barkPowerData = {
                                barksReceived: item.barksReceived
                            };
                            found = true;
                            console.log('Twitter handle found in leaderboard.');
                            break;
                        }
                    }

                    if (!found) {
                        console.log('Twitter handle not found in leaderboard.');
                        document.getElementById('error').textContent = "No barks received for this Twitter handle.";
                        return;
                    }

                    displayBarkPowerData(barkPowerData, accountLabel, userData, null, null);
                    return;
                }
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
        document.getElementById('error').textContent = `An error occurred: ${error.message}. Please ensure the account ID or Twitter handle is correct and try again.`;
    }
}

function displayBarkPowerData(barkPowerData, accountLabel, userData = null, hbarkBalance = null, accountId = null) {
    console.log(`Displaying data with accountLabel: ${accountLabel}`);
    let output = `<p><strong>Account Label:</strong> ${accountLabel}</p>`;

    if (barkPowerData && (barkPowerData.todayAllocatedBarks !== undefined)) {
        console.log('Displaying barking power details.');
        // Existing logic for displaying barking power details
        const barkPowerUsed = barkPowerData.todayAllocatedBarks - barkPowerData.barkingPower;
        const barkPowerPercentageUsed = (barkPowerUsed / barkPowerData.todayAllocatedBarks) * 100;

        output += `
            <p><strong>Bark Power Refilled:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.todayAllocatedBarks))}</p>
            <p><strong>Barking Power Remaining:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.barkingPower))}</p>
            <p><strong>Bark Power Used Today:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerUsed))}</p>
            <p><strong>Total Barks Given:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.totalBarksDonated))}</p>
            <p><strong>Total Barks Received:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.barksReceived))}</p>
        `;

        // Include More Details section
        const accountIdToUse = barkPowerData.accountId || accountId;
        const hashscanUrl = `https://hashscan.io/mainnet/account/${accountIdToUse}`;
        output += `
            <hr>
            <div id="extraDetails" class="toggle-section">
                <p><strong>Account ID:</strong> <a href="${hashscanUrl}" target="_blank">${accountIdToUse}</a></p>
        `;

        // Include Twitter handle if available
        if (userData && userData.twitterHandle) {
            output += `<p><strong>Twitter Handle:</strong> @${userData.twitterHandle}</p>`;
        }

        // Include $hbark Token Balance
        output += `<p><strong>$hbark Token Balance:</strong> ${hbarkBalance !== null ? BarkUtils.formatNumber(hbarkBalance) : 'N/A'}</p>`;

        // Include hodlRelativeBarkingPower and lpRelativeBarkingPower
        output += `
                <p><strong>$hBARK Balance (HODL) at time of last refill:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.hodlRelativeBarkingPower / 2))}</p>
                <p><strong>$hBARK Balance (LP) at time of last refill:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.lpRelativeBarkingPower / 3))}</p>
            </div>
        `;

        // Display progress bar and details
        document.getElementById("output").innerHTML = output;

        const toggleDetailsElement = document.getElementById("toggleDetails");
        if (toggleDetailsElement) {
            toggleDetailsElement.style.display = "block"; // Show the toggle button
        }

        const extraDetailsElement = document.getElementById("extraDetails");
        if (extraDetailsElement) {
            extraDetailsElement.style.display = "none"; // Hide details section initially
        }

        const progressContainerElement = document.getElementById("progressContainer");
        if (progressContainerElement) {
            progressContainerElement.style.display = "block"; // Show progress bar container
        }

        const clearSearchElement = document.getElementById("clearSearch");
        if (clearSearchElement) {
            clearSearchElement.style.display = "block"; // Show progress bar container
        }

        const outputElement = document.getElementById("output");
        if (outputElement) {
            outputElement.style.display = "block";
        }

        updateProgressBar(barkPowerPercentageUsed);
    } else if (barkPowerData && barkPowerData.barksReceived !== undefined) {
        console.log('Displaying barks received data for unlinked user.');
        // For users who have not linked a Hedera account but have received barks
        //output += `<p>This user can receive Barks but cannot give them since they do not own $hBARK or have a linked Hedera account.</p>`;
        output += `<p><strong>Total Barks Received:</strong> ${BarkUtils.formatNumber(barkPowerData.barksReceived)}</p>`;
        document.getElementById("output").innerHTML = output;
    } else {
        console.log('Displaying basic information without barking power data.');
        // When barkPowerData is not available or missing expected properties
        // Display $hbark Token Balance if available
        if (hbarkBalance !== null) {
            output += `<p><strong>$hbark Token Balance:</strong> ${BarkUtils.formatNumber(hbarkBalance)}</p>`;
        }

        // Include Account ID if available
        if (accountId) {
            const hashscanUrl = `https://hashscan.io/mainnet/account/${accountId}`;
            output += `
                <hr>
                <div id="extraDetails" class="toggle-section">
                    <p><strong>Account ID:</strong> <a href="${hashscanUrl}" target="_blank">${accountId}</a></p>
            `;
        }

        // Include Twitter handle if available
        if (userData && userData.twitterHandle) {
            output += `<p><strong>Twitter Handle:</strong> @${userData.twitterHandle}</p>`;
        }

        if (accountId || (userData && userData.twitterHandle)) {
            output += `</div>`;

            const toggleDetailsElement = document.getElementById("toggleDetails");
            if (toggleDetailsElement) {
                toggleDetailsElement.style.display = "block"; // Show the toggle button
            }

            const extraDetailsElement = document.getElementById("extraDetails");
            if (extraDetailsElement) {
                extraDetailsElement.style.display = "none"; // Hide details section initially
            }
        }

        document.getElementById("output").innerHTML = output;
    }
}

function clearSearch() {
    // Hide elements only if they exist
    const toggleDetailsElement = document.getElementById("toggleDetails");
    if (toggleDetailsElement) {
        toggleDetailsElement.style.display = "none";
    }
    const progressContainerElement = document.getElementById("progressContainer");
    if (progressContainerElement) {
        progressContainerElement.style.display = "none";
    }
    // Hide elements only if they exist
    const clearSearchElement = document.getElementById("clearSearch");
    if (clearSearchElement) {
        clearSearchElement.style.display = "none";
    }
    const twitterHandleElement = document.getElementById("twitterHandle");
    if (twitterHandleElement) {
        twitterHandleElement.value = "";
    }
    const outputElement = document.getElementById("output");
    if (outputElement) {
        outputElement.style.display = "none";
    }
}


// Function to fetch and display the "Barks Remaining" leaderboard
async function fetchBarksRemaining() {
    const leaderboardTable = document.getElementById('barksRemainingLeaderboardBody');
    const leaderboard = document.getElementById('barksRemainingLeaderboard'); // Get the table element

    try {
        let data = await BarkApi.fetchBarkingPowerLeaderboard();
        if (data == null) {
            console.error('Failed to fetch barks remaining data.');
            return;
        }

        // Clear existing leaderboard content
        leaderboardTable.innerHTML = '';

        // Loop through the data and populate the leaderboard
        data.forEach((item) => {
            let row = document.createElement('tr');

            // Check if twitterHandle exists, if not use accountId
            let displayName = item.twitterHandle ? item.twitterHandle : item.accountId;

            // Create the Twitter User (or Account ID) cell
            let twitterUserCell = document.createElement('td');
            twitterUserCell.style.cursor = 'pointer';
            twitterUserCell.textContent = displayName;

            twitterUserCell.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                let twitterInput = document.getElementById('twitterHandle');
                twitterInput.value = displayName;

                let submitButton = document.getElementById('checkBarkPower');
                submitButton.click();
            });

            // Create the Bark Power Remaining cell (with number formatting)
            let barkPowerRemainingCell = document.createElement('td');
            barkPowerRemainingCell.textContent = item.barkingPower.toLocaleString('en-US'); // format number with commas

            // Append the cells to the row
            row.appendChild(twitterUserCell);
            row.appendChild(barkPowerRemainingCell);

            // Append the row to the table body
            leaderboardTable.appendChild(row);
        });

        // Show the leaderboard after the data is loaded
        leaderboard.style.display = 'table'; // Ensures the table is visible
    } catch (error) {
        console.error('Error occurred while fetching barks remaining data:', error);
    }
}

// Event listener for the button click to trigger fetching barks remaining
const fetchBarksRemainingButton = document.getElementById('fetchBarksRemainingButton');
if (fetchBarksRemainingButton) {
    fetchBarksRemainingButton.addEventListener('click', fetchBarksRemaining);
}

// Function to toggle the visibility of additional details
function toggleDetails() {
    const extraDetails = document.getElementById("extraDetails");
    const toggleDetailsButton = document.getElementById("toggleDetails");

    if (extraDetails && toggleDetailsButton) {
        if (extraDetails.style.display === "none" || extraDetails.style.display === "") {
            // Show details
            extraDetails.style.display = "block";
            toggleDetailsButton.innerText = "Hide Details";
        } else {
            // Hide details
            extraDetails.style.display = "none";
            toggleDetailsButton.innerText = "Show More Details";
        }
    }
}

// Function to update the progress bar based on bark power usage
function updateProgressBar(percentageUsed) {
    const progressBar = document.getElementById("progressBar");

    // Check if the element exists before updating it
    if (!progressBar) {
        console.error("Progress bar element not found.");
        return;
    }

    // Check if percentageUsed is NaN
    if (isNaN(percentageUsed)) {
        progressBar.innerText = "No Bark Power to Use";
        progressBar.style.width = "100%";
        progressBar.style.backgroundColor = "#ff0000"; // Set to red for NaN
    } else {
        // Update progress bar with valid percentage and reset styles
        progressBar.style.width = `${percentageUsed}%`;
        progressBar.innerText = `${Math.floor(percentageUsed)}% Used`;

        // Reset the background color to default or desired color
        progressBar.style.backgroundColor = "#00cc99"; // Example color, change to your desired one
    }
}
