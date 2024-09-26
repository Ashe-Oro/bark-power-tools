// Global flag for toggling
let detailsVisible = false;

const BASE_URLS = {
    mirrorNode: 'https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.5022567',
    barkingPower: 'https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power',
    users: 'https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users',
    leaderboard: 'https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard',
}

class BarkUtils {
    // Method to sanitize the Twitter handle
    static sanitizeTwitterHandle(handle) {
        // Remove the @ symbol if it exists
        return handle.replace(/^@/, '');
    }

    // Method to sanitize general input to prevent XSS or other issues
    static sanitizeInput(input) {
        return input.replace(/[<>\/]/g, ''); // Strip harmful characters
    }

    // Method to check if the input is a valid Hedera accountId in the format 0.0.xxxx
    static isAccountId(input) {
        const accountIdRegex = /^0\.0\.\d+$/;
        return accountIdRegex.test(input);
    }

    // Method to format numbers with commas
    static formatNumber(number) {
        return number.toLocaleString('en-US'); // Formats number with commas for the US
    }
}

class BarkApi {

    static async fetchUserByTwitter(twitterHandle) {
        const url = `${BASE_URLS.users}/twitter/${twitterHandle}`;
        const response = await fetch(url);

        // Read the response body regardless of the status code
        const data = await response.json();

        // Return the data even if the response is not OK
        return data;
    }

    static async fetchBalance(accountId) {
        const url = `${BASE_URLS.mirrorNode}/balances?account.id=${accountId}`;
        const response = await fetch(url);
        return await response.json();
    }

    static async fetchBarkingPower(accountId) {
        const url = `${BASE_URLS.barkingPower}/${accountId}`;
        const response = await fetch(url);
        return await response.json();
    }

    static async fetchUserByAccountId(accountId) {
        const url = `${BASE_URLS.users}/${accountId}`;
        const response = await fetch(url);
        return await response.json();
    }

    static async fetchBarksRemainingLeaderboard(limit = 1000) {
        const url = `${BASE_URLS.leaderboard}/${limit}`;
        const response = await fetch(url);
        return await response.json();
    }

    static async fetchBarkingPowerLeaderboard(limit = 1000) {
        const url = `${BASE_URLS.leaderboard}/barkingPower/${limit}`;
        const response = await fetch(url);
        return await response.json();
    }

    // New method to fetch Barks Given Leaderboard Position by accountId
    static async fetchBarksGivenPosition(accountId) {
        const url = `${BASE_URLS.leaderboard}/totalBarksDonated/${accountId}/position`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch Barks Given Leaderboard position.');
        }
        return await response.json();
    }

    // New method to fetch Barks Received Leaderboard Position by accountId
    static async fetchBarksReceivedPosition(accountId) {
        const url = `${BASE_URLS.leaderboard}/${accountId}/position`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch Barks Received Leaderboard position.');
        }
        return await response.json();
    }

    static async fetchFullBarksReceivedLeaderboard(limit = 2000) {
        const url = `${BASE_URLS.leaderboard}/${limit}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch Full Barks Received Leaderboard.');
        }
        const data = await response.json();
        return data;
    }
    
}

class BarkView {
    static clearOutput() {
        document.getElementById("output").innerHTML = "";
        document.getElementById("error").innerHTML = "";


        const extraDetails = document.getElementById("extraDetails");
        if (extraDetails) {
            extraDetails.style.display = "none";
        }

        const toggleDetailsButton = document.getElementById("toggleDetails");
        if (toggleDetailsButton) {
            toggleDetailsButton.innerText = "Show More Details";
        }
    }

    static displayErrorMessage(error, message) {
        let errorMessage = "";
        if (error) {
            errorMessage = `An error occurred: ${error.message}. `;
        }
        errorMessage += message;

        document.getElementById('error').textContent = errorMessage;
        error ? console.error(message, error) : console.error(message);
    }


        // Modify displayBarkPowerData to include leaderboard positions
        static displayBarkPowerData(
            barkPowerData,
            accountLabel,
            userData = null,
            hbarkBalance = null,
            accountId = null,
            leaderboardPositions = null
        ) {
            console.log(`Displaying data with accountLabel: ${accountLabel}`);
            let output = BarkView.buildBasicOutput(accountLabel);
        
            // Reset UI elements to default state
            BarkView.toggleElementDisplay("toggleDetails", "none");
            BarkView.toggleElementDisplay("progressContainer", "none");
            BarkView.toggleElementDisplay("extraDetails", "none");
        
            if (barkPowerData && barkPowerData.todayAllocatedBarks !== undefined) {
                console.log('Displaying barking power details.');
                output += BarkView.buildDetailedBarkPowerOutput(
                    barkPowerData,
                    hbarkBalance,
                    accountId,
                    userData
                );
        
                // Display Leaderboard Positions if available
                if (leaderboardPositions) {
                    output += BarkView.buildLeaderboardPositionsSection(leaderboardPositions);
                }
        
                document.getElementById("output").innerHTML = output;
                BarkView.updateUIElementsForDetailedView(barkPowerData);
        
            } else if (barkPowerData && barkPowerData.barksReceived !== undefined) {
                console.log('Displaying barks received data for unlinked user.');
                output += BarkView.buildUnlinkedUserBarksReceivedOutput(barkPowerData);
        
                // Display Leaderboard Positions if available
                if (leaderboardPositions) {
                    output += BarkView.buildLeaderboardPositionsSection(leaderboardPositions);
                }
        
                document.getElementById("output").innerHTML = output;
                document.getElementById("clearSearch").style.display = "block";
        
                // Ensure irrelevant UI elements are hidden
                // These lines are optional now since we reset at the start
                // BarkView.toggleElementDisplay("toggleDetails", "none");
                // BarkView.toggleElementDisplay("progressContainer", "none");
                // BarkView.toggleElementDisplay("extraDetails", "none");
        
            } else {
                console.log('Displaying basic information without barking power data.');
                output += BarkView.buildBasicInfoOutput(hbarkBalance, accountId, userData);
        
                // Display Leaderboard Positions if available
                if (leaderboardPositions) {
                    output += BarkView.buildLeaderboardPositionsSection(leaderboardPositions);
                }
        
                document.getElementById("output").innerHTML = output;
                BarkView.toggleUIElementsForBasicView(accountId, userData);
            }
        }
        

        // New method to build the leaderboard positions section
        static buildLeaderboardPositionsSection(leaderboardPositions) {
            return `
                <div id="leaderboardPositions">
                    <h4>Leaderboard Positions</h4>
                    <p><strong>Barks Given Position:</strong> ${leaderboardPositions.barksGiven?.rank || 'n/a'}</p>
                    <p><strong>Barks Received Position:</strong> ${leaderboardPositions.barksReceived?.rank || 'n/a'}</p>
                </div>
            `;
        }

    // Helper function to build the basic account label output
    static buildBasicOutput(accountLabel) {
        return `<p><strong>Account Label:</strong> ${accountLabel}</p>`;
    }

    // Helper function to build the detailed barking power output
    static buildDetailedBarkPowerOutput(barkPowerData, hbarkBalance, accountId, userData) {
        const barkPowerUsed = barkPowerData.todayAllocatedBarks - barkPowerData.barkingPower;
        const barkPowerPercentageUsed = (barkPowerUsed / barkPowerData.todayAllocatedBarks) * 100;

        let output = `
            <p><strong>Bark Power Refilled:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.todayAllocatedBarks))}</p>
            <p><strong>Barking Power Remaining:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.barkingPower))}</p>
            <p><strong>Bark Power Used Today:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerUsed))}</p>
            <p><strong>Total Barks Given:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.totalBarksDonated))}</p>
            <p><strong>Total Barks Received:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.barksReceived))}</p>
        `;

        output += BarkView.buildMoreDetailsSection(barkPowerData, hbarkBalance, accountId, userData);

        return output;
    }

    // Helper function to build the "More Details" section
    static buildMoreDetailsSection(barkPowerData, hbarkBalance, accountId, userData) {
        const accountIdToUse = barkPowerData.accountId || accountId;
        const hashscanUrl = `https://hashscan.io/mainnet/account/${accountIdToUse}`;

        let output = `
            <hr>
            <div id="extraDetails" class="toggle-section">
                <p><strong>Account ID:</strong> <a href="${hashscanUrl}" target="_blank">${accountIdToUse}</a></p>
        `;

        if (userData && userData.twitterHandle) {
            output += `<p><strong>Twitter Handle:</strong> @${userData.twitterHandle}</p>`;
        }

        output += `<p><strong>$hbark Token Balance:</strong> ${hbarkBalance !== null ? BarkUtils.formatNumber(hbarkBalance) : 'N/A'}</p>`;

        output += `
                <p><strong>$hBARK Balance (HODL) at time of last refill:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.hodlRelativeBarkingPower / 2))}</p>
                <p><strong>$hBARK Balance (LP) at time of last refill:</strong> ${BarkUtils.formatNumber(Math.floor(barkPowerData.lpRelativeBarkingPower / 3))}</p>
            </div>
        `;

        return output;
    }

    // Helper function to update UI elements for the detailed view
    static updateUIElementsForDetailedView(barkPowerData) {
        const barkPowerUsed = barkPowerData.todayAllocatedBarks - barkPowerData.barkingPower;
        const barkPowerPercentageUsed = (barkPowerUsed / barkPowerData.todayAllocatedBarks) * 100;

        BarkView.toggleElementDisplay("toggleDetails", "block");
        BarkView.toggleElementDisplay("extraDetails", "none");
        BarkView.toggleElementDisplay("progressContainer", "block");
        BarkView.toggleElementDisplay("clearSearch", "block");
        BarkView.toggleElementDisplay("output", "block");

        BarkView.updateProgressBar(barkPowerPercentageUsed);
    }

    // Helper function to build output for unlinked users who have received barks
    static buildUnlinkedUserBarksReceivedOutput(barkPowerData) {
        return `<p><strong>Total Barks Received:</strong> ${BarkUtils.formatNumber(barkPowerData.barksReceived)}</p>`;
    }

    // Helper function to build basic information output
    static buildBasicInfoOutput(hbarkBalance, accountId, userData) {
        let output = '';

        if (hbarkBalance !== null) {
            output += `<p><strong>$hbark Token Balance:</strong> ${BarkUtils.formatNumber(hbarkBalance)}</p>`;
        }

        if (accountId) {
            const hashscanUrl = `https://hashscan.io/mainnet/account/${accountId}`;
            output += `
                <hr>
                <div id="extraDetails" class="toggle-section">
                    <p><strong>Account ID:</strong> <a href="${hashscanUrl}" target="_blank">${accountId}</a></p>
            `;
        }

        if (userData && userData.twitterHandle) {
            output += `<p><strong>Twitter Handle:</strong> @${userData.twitterHandle}</p>`;
        }

        if (accountId || (userData && userData.twitterHandle)) {
            output += `</div>`;
        }

        return output;
    }

    // Helper function to toggle UI elements for the basic view
    static toggleUIElementsForBasicView(accountId, userData) {
        if (accountId || (userData && userData.twitterHandle)) {
            BarkView.toggleElementDisplay("toggleDetails", "block");
            BarkView.toggleElementDisplay("extraDetails", "none");
        }
    }

    // Utility function to toggle the display of an element
    static toggleElementDisplay(elementId, displayStyle) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = displayStyle;
        }
    }

    // Function to update the progress bar based on bark power usage
    static updateProgressBar(percentageUsed) {
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

    // Function to show the account spinner
    static showAccountSpinner() {
        const spinner = document.getElementById("account-spinner");
        if (spinner) {
            spinner.style.display = "block";
        }
    }

    // Function to hide the account spinner
    static hideAccountSpinner() {
        const spinner = document.getElementById("account-spinner");
        if (spinner) {
            spinner.style.display = "none";
        }
    }

    // Function to show the leaderboard spinner
    static showLeaderboardSpinner() {
        const spinner = document.getElementById("leaderboard-spinner");
        if (spinner) {
            spinner.style.display = "block";
        }
    }

    // Function to hide the leaderboard spinner
    static hideLeaderboardSpinner() {
        const spinner = document.getElementById("leaderboard-spinner");
        if (spinner) {
            spinner.style.display = "none";
        }
    }

    // Function to fetch and display the "Barks Remaining" leaderboard
    static async fetchBarksRemaining() {
        const leaderboardTable = document.getElementById('barksRemainingLeaderboardBody');
        const leaderboard = document.getElementById('barksRemainingLeaderboard'); // Get the table element

        // Show the leaderboard spinner before fetching data
        BarkView.showLeaderboardSpinner();
        // Hide the leaderboard table while loading
        leaderboard.style.display = 'none';

        try {
            let data = await BarkApi.fetchBarkingPowerLeaderboard();

            if (!data) {
                console.error('Failed to fetch barks remaining data.');
                return;
            }

            // Clear existing leaderboard content
            leaderboardTable.innerHTML = '';

            // Loop through the data and populate the leaderboard
            data.forEach((item) => {
                BarkView.addUserCell(item, leaderboardTable);
            });

            // Show the leaderboard after the data is loaded
            leaderboard.style.display = 'table'; // Ensures the table is visible
        } catch (error) {
            console.error('Error occurred while fetching barks remaining data:', error);
        } finally {
            BarkView.hideLeaderboardSpinner();
        }
    }

    static addUserCell(item, leaderboardTable) {
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
    }

    // Function to toggle the visibility of additional details
    static toggleDetails() {
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

    static clearSearch() {
        // Hide elements only if they exist
        BarkView.toggleElementDisplay("toggleDetails", "none");
        BarkView.toggleElementDisplay("progressContainer", "none");
        BarkView.toggleElementDisplay("clearSearch", "none");
        BarkView.toggleElementDisplay("output", "none");

        const twitterHandleElement = document.getElementById("twitterHandle");
        if (twitterHandleElement) {
            twitterHandleElement.value = "";
        }
    }
}

class BarkManager {
    static async checkBarkPower() {
        BarkView.clearOutput();
        BarkView.showAccountSpinner();

        let userInput = BarkManager.getUserInput();
        let isHederaAccountInput = BarkUtils.isAccountId(userInput);

        try {
            if (isHederaAccountInput) {
                await BarkManager.processHederaAccount(userInput);
            } else {
                await BarkManager.processTwitterHandle(userInput);
            }
        } catch (error) {
            BarkView.displayErrorMessage(error, "Please ensure the account ID or Twitter handle is correct and try again.");
        } finally {
            BarkView.hideAccountSpinner();  // Hide the spinner after processing is done
        }
    }

    static getUserInput() {
        let userInput = document.getElementById('twitterHandle').value;
        return BarkUtils.sanitizeInput(userInput);
    }

    static async processHederaAccount(accountId) {
        let hbarkBalance = 0;
        let barkPowerData = null;
        let userData = null;

        const [balanceData, barkingPowerData, userDataResult] = await Promise.all([
            BarkApi.fetchBalance(accountId),
            BarkApi.fetchBarkingPower(accountId),
            BarkApi.fetchUserByAccountId(accountId)
        ]);

        hbarkBalance = balanceData.balances?.[0]?.balance || 0;
        let accountLabel = BarkManager.updateAccountLabelBasedOnBalance(hbarkBalance);
        console.log(`Account Label after balance check: ${accountLabel}`);

        if (barkingPowerData.code === "HBARK_USER_NOT_FOUND") {
            accountLabel = BarkManager.updateAccountLabelForNoBarkPower(hbarkBalance);
            console.log(`Account Label after barking power check: ${accountLabel}`);

            BarkView.displayBarkPowerData(null, accountLabel, null, hbarkBalance, accountId);
            return;
        }

        barkPowerData = barkingPowerData;
        const userDataProcessed = await BarkManager.processUserData(userDataResult);
        userData = userDataProcessed.userData;
        accountLabel = userDataProcessed.accountLabel;
        console.log(`Account Label after user data check: ${accountLabel}`);

        // Fetch Leaderboard Positions
        let leaderboardPositions = { barksGiven: null, barksReceived: null };
        try {
            const [barksGivenPosition, barksReceivedPosition] = await Promise.all([
                BarkApi.fetchBarksGivenPosition(accountId),
                BarkApi.fetchBarksReceivedPosition(accountId)
            ]);
            leaderboardPositions.barksGiven = barksGivenPosition;
            leaderboardPositions.barksReceived = barksReceivedPosition;
        } catch (error) {
            console.error('Error fetching leaderboard positions:', error);
        }

        BarkView.displayBarkPowerData(barkPowerData, accountLabel, userData, hbarkBalance, accountId, leaderboardPositions);
    }

    static async processTwitterHandle(twitterHandleInput) {
        let accountLabel = '';
        let barkPowerData = null;

        const twitterHandle = BarkUtils.sanitizeTwitterHandle(twitterHandleInput);
        const userData = await BarkApi.fetchUserByTwitter(twitterHandle);

        if (userData.code === "HBARK_USER_NOT_FOUND") {
            // Handle the case where the user has not linked their Hedera account
            accountLabel = "Has not linked with Hedera Account";
            let leaderboardData;
            try {
                leaderboardData = await BarkApi.fetchFullBarksReceivedLeaderboard();
            } catch (error) {
                console.error('Error fetching full Barks Received Leaderboard:', error);
                document.getElementById('error').textContent = "Unable to fetch leaderboard data at this time.";
                return;
            }

            // Find the user's position based on twitterHandle
            const position = leaderboardData.findIndex(
                item => item.twitterHandle?.toLowerCase() === twitterHandle.toLowerCase()
            ) + 1; // +1 because array indices start at 0

            if (position > 0) {
                barkPowerData = { barksReceived: leaderboardData[position - 1].barksReceived };
                let leaderboardPositions = {
                    barksGiven: null,
                    barksReceived: { rank: position }
                };
                BarkView.displayBarkPowerData(barkPowerData, accountLabel, null, null, null, leaderboardPositions);
            } else {
                document.getElementById('error').textContent = "No barks received for this Twitter handle.";
            }
        } else {
            // User has linked their account, proceed as before
            const accountId = userData.accountId;
            const [barkingPowerData, balanceData] = await Promise.all([
                BarkApi.fetchBarkingPower(accountId),
                BarkApi.fetchBalance(accountId)
            ]);

            barkPowerData = barkingPowerData;
            let hbarkBalance = balanceData.balances?.[0]?.balance || 0;
            accountLabel = BarkManager.determineAccountLabel(userData);

            // Fetch Leaderboard Positions
            let leaderboardPositions = { barksGiven: null, barksReceived: null };
            try {
                const [barksGivenPosition, barksReceivedPosition] = await Promise.all([
                    BarkApi.fetchBarksGivenPosition(accountId),
                    BarkApi.fetchBarksReceivedPosition(accountId)
                ]);
                leaderboardPositions.barksGiven = barksGivenPosition;
                leaderboardPositions.barksReceived = barksReceivedPosition;
            } catch (error) {
                console.error('Error fetching leaderboard positions:', error);
            }

            BarkView.displayBarkPowerData(barkPowerData, accountLabel, userData, hbarkBalance, accountId, leaderboardPositions);
        }
    }

    static updateAccountLabelBasedOnBalance(hbarkBalance) {
        if (hbarkBalance > 0) {
            console.log(`$hbark balance found: ${hbarkBalance}`);
            return "Current $HBARK holder";
        } else {
            console.log('No $hbark balance found.');
            return "Account does not currently hold $HBARK";
        }
    }

    static updateAccountLabelForNoBarkPower(hbarkBalance) {
        if (hbarkBalance === 0) {
            return "Account does not currently hold $HBARK and has not been allocated Bark Power";
        } else {
            return "$HBARK Holder, but has not been allocated Bark Power";
        }
    }

    static async processUserData(userData) {
        let accountLabel;
        if (userData.code === "HBARK_USER_NOT_FOUND") {
            console.log('User data not found in users endpoint.');
            accountLabel = "Holds $HBARK and has been refilled with Bark Power";
            return { userData: null, accountLabel };
        } else {
            console.log('User data found.');
            accountLabel = BarkManager.determineAccountLabel(userData);
            return { userData, accountLabel };
        }
    }

    static determineAccountLabel(userData) {
        if (userData.signedTermMessage) {
            return "Signed Terms";
        } else if (userData.twitterHandle) {
            return "Twitter Account Linked";
        } else {
            return "$HBARK Holder, allocated Bark Power";
        }
    }
}


// Event listener for the checkBarkPower function
const checkBarkPowerButton = document.getElementById('checkBarkPower');
if (checkBarkPowerButton) {
    checkBarkPowerButton.addEventListener('click', BarkManager.checkBarkPower);
}

// Event listener for the button click to trigger fetching barks remaining
const fetchBarksRemainingButton = document.getElementById('fetchBarksRemainingButton');
if (fetchBarksRemainingButton) {
    fetchBarksRemainingButton.addEventListener('click', BarkView.fetchBarksRemaining);
}

// Update the toggleDetails and clearSearch functions to use BarkView
function toggleDetails() {
    BarkView.toggleDetails();
}

function clearSearch() {
    BarkView.clearSearch();
}

async function checkBarkPower() {
    await BarkManager.checkBarkPower();
}


