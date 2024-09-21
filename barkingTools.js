// Global flag for toggling
let detailsVisible = false;

// Function to sanitize the Twitter handle
function sanitizeTwitterHandle(handle) {
    // Remove the @ symbol if it exists
    return handle.replace(/^@/, '');
}

// Function to sanitize general input to prevent XSS or other issues
function sanitizeInput(input) {
    return input.replace(/[<>\/]/g, ''); // Strip harmful characters
}

// Function to check if the input is a valid accountId in the format 0.0.xxxx
function isAccountId(input) {
    // Regex to match the accountId format (e.g., 0.0.5225094)
    const accountIdRegex = /^0\.0\.\d+$/;
    return accountIdRegex.test(input);
}

// Function to format numbers with commas
function formatNumber(number) {
    return number.toLocaleString('en-US'); // Formats number with commas for the US
}

// Updated checkBarkPower function following the specified logic paths
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

    // Get the user input (could be a Twitter handle or accountId)
    let userInput = document.getElementById('twitterHandle').value;

    // Sanitize the user input
    userInput = sanitizeInput(userInput);

    // Check if the input is a Hedera account ID
    let isHederaAccount = isAccountId(userInput);

    try {
        if (isHederaAccount) {
            // Hedera Account Logic Path
            const accountId = userInput;

            // Step 1: Fetch barking power from barking-power endpoint
            let barkingPowerUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/${accountId}`;
            let barkingPowerResponse = await fetch(barkingPowerUrl);
            let barkingPowerData = await barkingPowerResponse.json();

            if (barkingPowerData.code === "HBARK_USER_NOT_FOUND") {
                // Account is not an $HBARK holder
                document.getElementById('error').textContent = "Account is not an $HBARK holder.";
                return;
            } else {
                // Valid $HBARK holder
                let barkPowerData = barkingPowerData;

                // Step 2: Attempt to fetch from users endpoint
                let userUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/${accountId}`;
                let userResponse = await fetch(userUrl);
                let userData = await userResponse.json();

                let accountLabel = "$HBARK holder";

                if (userData.code === "HBARK_USER_NOT_FOUND") {
                    accountLabel = "$HBARK Holder only";
                    userData = null; // No user data available
                } else {
                    if (userData.signedTermMessage) {
                        accountLabel = "Signed Terms";
                    } else if (userData.twitterHandle) {
                        accountLabel = "Twitter Account Linked";
                    }
                }

                // Step 3: Fetch $hbark token balance
                let balanceUrl = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.5022567/balances?account.id=${accountId}`;
                let balanceResponse = await fetch(balanceUrl);
                let balanceData = await balanceResponse.json();

                let hbarkBalance = 0;
                if (balanceData.balances && balanceData.balances.length > 0) {
                    hbarkBalance = balanceData.balances[0].balance;
                }

                // Pass hbarkBalance to display function
                displayBarkPowerData(barkPowerData, accountLabel, userData, hbarkBalance);
                return;
            }
        } else {
            // Twitter Handle Logic Path
            let twitterHandle = sanitizeTwitterHandle(userInput);

            if (!twitterHandle) {
                document.getElementById('error').textContent = 'Please enter a valid Twitter handle.';
                return;
            }

            // Step 1: Fetch from users/twitter endpoint
            let userUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/twitter/${twitterHandle}`;
            let userResponse = await fetch(userUrl);
            let userData = await userResponse.json();

            if (userData.code === "HBARK_USER_NOT_FOUND") {
                // User has not linked a Hedera account
                let accountLabel = "Has not linked with Hedera Account";

                // Step 2: Fetch barksReceived from leaderboard
                let leaderboardUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard/1000`;
                let leaderboardResponse = await fetch(leaderboardUrl);
                let leaderboardData = await leaderboardResponse.json();

                // Find the twitterHandle in the leaderboard data
                let found = false;
                for (let item of leaderboardData) {
                    if (item.twitterHandle && item.twitterHandle.toLowerCase() === twitterHandle.toLowerCase()) {
                        let barkPowerData = {
                            barksReceived: item.barksReceived
                        };
                        displayBarkPowerData(barkPowerData, accountLabel);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    document.getElementById('error').textContent = "No barks received for this Twitter handle.";
                }
                return;
            } else {
                // User data exists
                if (userData.accountId && userData.isVerified && userData.signedTermMessage) {
                    // Fully linked account
                    let accountLabel = "Fully linked account";
                    let accountId = userData.accountId;

                    // Fetch barking power data using accountId
                    let barkingPowerUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/${accountId}`;
                    let barkingPowerResponse = await fetch(barkingPowerUrl);
                    let barkingPowerData = await barkingPowerResponse.json();

                    // Fetch $hbark token balance
                    let balanceUrl = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.5022567/balances?account.id=${accountId}`;
                    let balanceResponse = await fetch(balanceUrl);
                    let balanceData = await balanceResponse.json();

                    let hbarkBalance = 0;
                    if (balanceData.balances && balanceData.balances.length > 0) {
                        hbarkBalance = balanceData.balances[0].balance;
                    }

                    displayBarkPowerData(barkingPowerData, accountLabel, userData, hbarkBalance);
                    return;
                } else {
                    // User has not fully linked a Hedera account
                    let accountLabel = "Has not linked with Hedera Account";

                    // Fetch barksReceived from leaderboard
                    let leaderboardUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard/1000`;
                    let leaderboardResponse = await fetch(leaderboardUrl);
                    let leaderboardData = await leaderboardResponse.json();

                    // Find the twitterHandle in the leaderboard data
                    let found = false;
                    for (let item of leaderboardData) {
                        if (item.twitterHandle && item.twitterHandle.toLowerCase() === twitterHandle.toLowerCase()) {
                            let barkPowerData = {
                                barksReceived: item.barksReceived
                            };
                            displayBarkPowerData(barkPowerData, accountLabel);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        document.getElementById('error').textContent = "No barks received for this Twitter handle.";
                    }
                    return;
                }
            }
        }
    } catch (error) {
        document.getElementById('error').textContent = `An error occurred: ${error.message}. Please ensure the account ID or Twitter handle is correct and try again.`;
    }
}

// Updated displayBarkPowerData function to handle the new logic and data
function displayBarkPowerData(barkPowerData, accountLabel, userData = null, hbarkBalance = null) {
    let output = `<p><strong>Account Label:</strong> ${accountLabel}</p>`;

    if (accountLabel === "$HBARK holder" || accountLabel === "$HBARK Holder only" || accountLabel === "Signed Terms" || accountLabel === "Twitter Account Linked" || accountLabel === "Fully linked account") {
        // For $HBARK holder accounts, display barking power details
        const barkPowerUsed = barkPowerData.todayAllocatedBarks - barkPowerData.barkingPower;
        const barkPowerPercentageUsed = (barkPowerUsed / barkPowerData.todayAllocatedBarks) * 100;

        output += `
            <p><strong>Bark Power Refilled:</strong> ${formatNumber(Math.floor(barkPowerData.todayAllocatedBarks))}</p>
            <p><strong>Barking Power Remaining:</strong> ${formatNumber(Math.floor(barkPowerData.barkingPower))}</p>
            <p><strong>Bark Power Used Today:</strong> ${formatNumber(Math.floor(barkPowerUsed))}</p>
            <p><strong>Total Barks Given:</strong> ${formatNumber(Math.floor(barkPowerData.totalBarksDonated))}</p>
            <p><strong>Total Barks Received:</strong> ${formatNumber(Math.floor(barkPowerData.barksReceived))}</p>
        `;

        // Include More Details section for all $HBARK holders
        const hashscanUrl = `https://hashscan.io/mainnet/account/${barkPowerData.accountId}`;
        output += `
            <hr>
            <div id="extraDetails" class="toggle-section">
                <p><strong>Account ID:</strong> <a href="${hashscanUrl}" target="_blank">${barkPowerData.accountId}</a></p>
        `;

        // Include Twitter handle if available
        if (userData && userData.twitterHandle) {
            output += `<p><strong>Twitter Handle:</strong> @${userData.twitterHandle}</p>`;
        }

        // Include $hbark Token Balance
        output += `<p><strong>$hbark Token Balance:</strong> ${formatNumber(hbarkBalance)}</p>`;

        // Include hodlRelativeBarkingPower and lpRelativeBarkingPower
        output += `
                <p><strong>$hBARK Balance (HODL) at time of last refill:</strong> ${formatNumber(Math.floor(barkPowerData.hodlRelativeBarkingPower / 2))}</p>
                <p><strong>$hBARK Balance (LP) at time of last refill:</strong> ${formatNumber(Math.floor(barkPowerData.lpRelativeBarkingPower / 3))}</p>
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

        updateProgressBar(barkPowerPercentageUsed);
    } else if (accountLabel === "Has not linked with Hedera Account") {
        // For users who have not linked a Hedera account but can receive barks
        output += `<p>This user can receive Barks but cannot give them since they do not own $hBARK or have a linked Hedera account.</p>`;
        if (barkPowerData.barksReceived !== undefined) {
            output += `<p><strong>Total Barks Received:</strong> ${formatNumber(Math.floor(barkPowerData.barksReceived))}</p>`;
        } else {
            output += `<p><strong>Total Barks Received:</strong> 0</p>`;
        }
        document.getElementById("output").innerHTML = output;
    }
}

// Function to fetch and display the "Barks Remaining" leaderboard
async function fetchBarksRemaining() {
    const url = 'https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard/barkingPower/50';
    const leaderboardTable = document.getElementById('barksRemainingLeaderboardBody');
    const leaderboard = document.getElementById('barksRemainingLeaderboard'); // Get the table element

    try {
        let response = await fetch(url);
        if (response.ok) {
            let data = await response.json();

            // Clear existing leaderboard content
            leaderboardTable.innerHTML = '';

            // Loop through the data and populate the leaderboard
            data.forEach((item) => {
                let row = document.createElement('tr');

                // Check if twitterHandle exists, if not use accountId
                let displayName = item.twitterHandle ? item.twitterHandle : item.accountId;

                // Create the Twitter User (or Account ID) cell
                let twitterUserCell = document.createElement('td');
                twitterUserCell.textContent = displayName;

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
        } else {
            console.error('Failed to fetch barks remaining data.');
        }
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
