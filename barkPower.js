// Global flag for toggling
let detailsVisible = false;

async function checkBarkPower() {
    // Clear previous output and error messages
    document.getElementById("output").innerHTML = "";
    document.getElementById("error").innerHTML = "";
    document.getElementById("toggleDetails").style.display = "none"; // Hide the toggle button initially
    document.getElementById("progressContainer").style.display = "none"; // Hide the progress bar initially

    const twitterHandle = document.getElementById('twitterHandle').value;

    if (!twitterHandle) {
        document.getElementById('error').textContent = 'Please enter a Twitter handle.';
        return;
    }

    // Step 1: Fetch user by Twitter handle
    const url = `http://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/twitter/${twitterHandle}`;
    
    try {
        let response = await fetch(url);
        if (response.ok) {
            let userData = await response.json();
            
            if (!userData.accountId) {
                document.getElementById('error').textContent = "Twitter user has not verified to play The Barking Game";
                return;
            }

            // Display the AccountID as a link
            let accountId = userData.accountId;
            const hashscanUrl = `https://hashscan.io/mainnet/account/0.0.7017957/${accountId}`;
            
            // Step 2: Fetch barking power using the accountId
            let barkingPowerUrl = `http://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/${accountId}`;
            
            response = await fetch(barkingPowerUrl);
            if (response.ok) {
                let barkPowerData = await response.json();

                // Calculate $hbark balances
                const hbarkBalanceHODL = barkPowerData.hodlRelativeBarkingPower / 2;
                const hbarkBalanceLP = barkPowerData.lpRelativeBarkingPower / 3;

                // Calculate Bark Power used vs available
                const barkPowerUsed = barkPowerData.todayAllocatedBarks - barkPowerData.barkingPower;
                const barkPowerPercentageUsed = (barkPowerUsed / barkPowerData.todayAllocatedBarks) * 100;

                // Display the core information (without HODL and LP balances)
                const output = `
                    <p><strong>Bark Power Refilled:</strong> ${Math.floor(barkPowerData.todayAllocatedBarks)}</p>
                    <p><strong>Barking Power Remaining:</strong> ${Math.floor(barkPowerData.barkingPower)}</p>
                    <p><strong>Bark Power Used Today:</strong> ${Math.floor(barkPowerUsed)}</p>
                    <hr>
                    <div id="extraDetails" class="toggle-section">
                        <p><strong>Account ID:</strong> <a href="${hashscanUrl}" target="_blank">${accountId}</a></p>
                        <p><strong>$hBARK Balance (HODL) at time of last refill:</strong> ${Math.floor(hbarkBalanceHODL)}</p>
                        <p><strong>$hBARK Balance (LP) at time of last refill:</strong> ${Math.floor(hbarkBalanceLP)}</p>
                        <p><strong>HODL Relative Barking Power:</strong> ${Math.floor(barkPowerData.hodlRelativeBarkingPower)}</p>
                        <p><strong>LP Relative Barking Power:</strong> ${Math.floor(barkPowerData.lpRelativeBarkingPower)}</p>
                        <p><strong>Total Barks Given:</strong> ${Math.floor(barkPowerData.totalBarksDonated)}</p>
                        <p><strong>Barks Received:</strong> ${Math.floor(barkPowerData.barksReceived)}</p>
                    </div>
                `;

                document.getElementById("output").innerHTML = output;
                document.getElementById("toggleDetails").style.display = "block"; // Show the toggle button
                document.getElementById("progressContainer").style.display = "block"; // Show the progress bar container

                // Update progress bar
                updateProgressBar(barkPowerPercentageUsed);
            } else {
                document.getElementById('error').textContent = "Failed to fetch barking power details.";
            }
        } else {
            document.getElementById('error').textContent = "Twitter user has not verified to play The Barking Game";
        }
    } catch (error) {
        document.getElementById("error").textContent = "An error occurred. Please try again.";
    }
}

// Function to toggle the visibility of additional details
function toggleDetails() {
    const extraDetails = document.getElementById("extraDetails");
    detailsVisible = !detailsVisible;

    if (detailsVisible) {
        extraDetails.style.display = "block";
        document.getElementById("toggleDetails").innerText = "Hide Details";
    } else {
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
