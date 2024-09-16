# Bark Power Tools

This is a web-based application that allows users to check **Bark Power** statistics in the Barking Game, which is part of the **HBARk Club**. It fetches data for both **Twitter handles** and **accountIds** in the Hedera Hashgraph ecosystem. The app also displays a leaderboard of users with **Bark Power Remaining**.

Visit our homepage at [hbark.club](https://hbark.club).

## Features

- **Check Bark Power by Twitter Handle or Account ID**: Users can enter either a Twitter handle or Hedera account ID (in the format `0.0.xxxx`) to retrieve and display their barking stats.
- **Leaderboard**: Displays the top 50 users with the most **Bark Power Remaining**.
- **Show More Details**: Users can toggle additional information such as `$hBARK` balances, **HODL** and **LP** barking power.

## Files

1. **`bark-power-tools.html`**  
   The HTML file for the Bark Power Tools interface. It includes:
   - A form for entering a Twitter handle or account ID to check barking stats.
   - A section to display **Bark Power Remaining** leaderboard.
   - The structure of the web page.

2. **`barkingTools.js`**  
   The JavaScript file that handles the logic for:
   - Fetching and displaying Bark Power data from APIs.
   - Handling inputs for both Twitter handles and account IDs.
   - Fetching and displaying the **Bark Power Remaining** leaderboard.
   - Toggling additional details.

3. **`bark-calc-widget-bkgd.png`**  
   A background image used in the application for visual styling.

## Usage

1. Clone this repository:

    ```bash
    git clone https://github.com/your-username/bark-power-tools.git
    ```

2. Open `bark-power-tools.html` in a browser:

    ```bash
    open bark-power-tools.html
    ```

3. **Check Bark Power**: Enter a Twitter handle or Hedera account ID (e.g., `0.0.5225094`) and click "Submit 🐶".
4. **Leaderboard**: Click the button labeled "Who's Got Barks Remaining?" to view the top 50 accounts with the most **Bark Power Remaining**.
5. **Show More Details**: After checking Bark Power, you can toggle additional details such as `$hBARK` balances and other barking power stats by clicking "Show More Details".

## APIs Used

- **Bark Power by Account ID or Twitter Handle**:  
  The app fetches user data from the following endpoints:
  - `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/{accountId}` for account IDs.
  - `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/users/twitter/{twitterHandle}` for Twitter handles.

- **Bark Power Remaining Leaderboard**:  
  The leaderboard data is fetched from:  
  `https://sure-angeline-piotrswierzy-b061c303.koyeb.app/barking-power/leaderboard/barkingPower/50`.

## Installation

No installation is required to use the Bark Power Tools web application. Simply open the HTML file in a browser after cloning the repository.

For any changes or customizations, you can edit the JavaScript (`barkingTools.js`) and HTML (`bark-power-tools.html`) files directly.

## Contributing

If you want to contribute to the development of this tool:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
