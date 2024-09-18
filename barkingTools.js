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

async function checkBarkPower() {
    // Clear previous output and error messages
    document.getElementById("output").innerHTML = "";
    document.getElementById("error").innerHTML = "";
    document.getElementById("toggleDetails").style.display = "none"; // Hide the toggle button initially
    document.getElementById("progressContainer").style.display = "none"; // Hide the progress bar initially

    // Get the user input (could be a Twitter handle or accountId)
    let userInput = document.getElementById('twitterHandle').value;

    // Sanitize the user input
    userInput = sanitizeInput(userInput);

    // Check if the input is an accountId or Twitter handle
    let url;
    if (isAccountId(userInput)) {
        // If it's an accountId, use the accountId-based API endpoint
        url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/${userInput}`;
    } else {
        // Otherwise, treat it as a Twitter handle and sanitize it further
        userInput = sanitizeTwitterHandle(userInput);

        if (!userInput) {
            document.getElementById('error').textContent = 'Please enter a valid Twitter handle or account ID.';
            return;
        }

        // Use the Twitter handle-based API endpoint
        url = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/twitter/${userInput}`;
    }

    try {
        let response = await fetch(url);
        if (response.ok) {
            let userData = await response.json();

            if (!userData.accountId) {
                document.getElementById('error').textContent = "User has not verified to play The Barking Game.";
                return;
            }

            // Display the AccountID as a link
            let accountId = userData.accountId;
            const hashscanUrl = `https://hashscan.io/mainnet/account/${accountId}`;

            // Fetch barking power using the accountId
            let barkingPowerUrl = `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/${accountId}`;
            response = await fetch(barkingPowerUrl);
            if (response.ok) {
                let barkPowerData = await response.json();

                // Calculate $hbark balances
                const hbarkBalanceHODL = barkPowerData.hodlRelativeBarkingPower / 2;
                const hbarkBalanceLP = barkPowerData.lpRelativeBarkingPower / 3;

                // Calculate Bark Power used vs available
                const barkPowerUsed = barkPowerData.todayAllocatedBarks - barkPowerData.barkingPower;
                const barkPowerPercentageUsed = (barkPowerUsed / barkPowerData.todayAllocatedBarks) * 100;

                // Step 3: Fetch the account balance from the additional API endpoint
                const userHbarkBalanceURL = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.5022567/balances?account.id=${accountId}`;
                let balanceResponse = await fetch(userHbarkBalanceURL);
                let balanceData = await balanceResponse.json();
                let accountBalance = balanceData.balances[0]?.balance || 0;

                // Calculate Activity Level
                const activityLevel = Math.floor((barkPowerData.totalBarksDonated / barkPowerData.barksReceived) * 100);
                let activityClass = "";
                let activityText = "";

                // Determine class and corresponding text based on activity level
                if (activityLevel < 25) {
                    activityClass = 'activity-red-bold'; // bold red
                    activityText = "Collecting Barks, but not Barking 👀";
                } else if (activityLevel >= 25 && activityLevel < 50) {
                    activityClass = 'activity-red'; // just red
                    activityText = "Collecting Barks, and Barking a little 😬";
                } else if (activityLevel >= 50 && activityLevel < 75) {
                    activityClass = 'activity-orange'; // orange
                    activityText = "Collecting Barks and Barking 🦜🏴‍☠️";
                } else if (activityLevel >= 75 && activityLevel <= 100) {
                    activityClass = 'activity-green'; // green
                    activityText = " 🏴‍☠️🏴‍☠️Big Bark Energy 🏴‍☠️🏴‍☠️";
                } else if (activityLevel > 100) {
                    activityClass = 'activity-green-bold'; // bold green
                    activityText = "🐶🗣️🏴‍☠️ A True Barkaneer! 🐶🗣️🏴‍☠️";
                }

                // Display the core information (with comma formatting for numbers)
                const output = `
                  <p><strong>Bark Power Refilled:</strong> ${formatNumber(Math.floor(barkPowerData.todayAllocatedBarks))}</p>
                  <p><strong>Barking Power Remaining:</strong> ${formatNumber(Math.floor(barkPowerData.barkingPower))}</p>
                  <p><strong>Bark Power Used Today:</strong> ${formatNumber(Math.floor(barkPowerUsed))}</p>
                  <p><strong>Total Barks Given:</strong> ${formatNumber(Math.floor(barkPowerData.totalBarksDonated))}</p>
                  <p><strong>Total Barks Received:</strong> ${formatNumber(Math.floor(barkPowerData.barksReceived))}</p>
                  <p><strong>Activity Level:</strong> <span class="${activityClass}">${formatNumber(activityLevel)}% - ${activityText}</span></p>
                  `;

                document.getElementById("output").innerHTML = output;

                document.getElementById("progressContainer").style.display = "block"; // Show the progress bar container

                // Update progress bar
                updateProgressBar(barkPowerPercentageUsed);
            } else {
                document.getElementById('error').textContent = "Failed to fetch barking power details.";
            }
        } else {
            document.getElementById('error').textContent = "User has not verified to play The Barking Game.";
        }
    } catch (error) {
        document.getElementById('error').textContent = "An error occurred while fetching data. Please ensure the account ID or Twitter handle is correct.";
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
document.getElementById('fetchBarksRemainingButton').addEventListener('click', fetchBarksRemaining);

// Function to toggle the visibility of additional details
function toggleDetails() {
    const extraDetails = document.getElementById("extraDetails");

    if (extraDetails.style.display === "none" || extraDetails.style.display === "") {
        // Show details
        extraDetails.style.display = "block";
        document.getElementById("toggleDetails").innerText = "Hide Details";
    } else {
        // Hide details
        extraDetails.style.display = "none";
        document.getElementById("toggleDetails").innerText = "Show More Details";
    }
}

// Function to update the progress bar
function updateProgressBar(percentageUsed) {
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = `${percentageUsed}%`;
    progressBar.innerText = `${Math.floor(percentageUsed)}% Used`;
}
