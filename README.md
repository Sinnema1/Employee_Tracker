
# Employee Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

This tool is intended to create a database and it's tables, provide inquirer prompts for a user to view, update, and delete rows of the different tables, and view the data using 3NF concepts.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Tests](#tests)
- [Questions](#questions)

## Installation

To install this project, you can clone it from the GitHub repository linked in the "Questions" section below.

## Usage

To use this project, you can either clone it to your own repository or create a branch and submit a pull request when you're done with the changes you'd like to make. The first step before using the tool is to create the database and tables then insert the data. This can be done using PostgreSQL. If you do not have it installed, follow instructions from the link in the "Questions" section below. Once you have PostgreSQL installed and configured, use `psql -U postgres` and enter your password, when prompted, to login. Now use `\c hr_db` to make sure you're connected to the right database. The next command will be `\i schema.sql` followed by `\i seeds.sql`. The database and tables should now be setup so you can exit postgreSQL cli using `\q`. The tool can now be built locally using `npm run build` followed by `npm run start`. Navigate through the prompts and when you're done, you can select Exit.

## License

This application is covered under the MIT license.

## Contributing

Anyone may contribute to this project, there are no restrictions.

## Tests

After cloning, you can make sure that the application is working first by running `npm install` to get all necessary packages. Next, check the package.json to learn more about the npm run commands. More thorough usage/test steps are outlined in the "Usage" section above.

## Questions

- Walkthrough Video: [Link](https://drive.google.com/file/d/1QGZks7LEipC_9zFDn-KaAS3BllOj1w0E/view?usp=share_link)
- GitHub: [Sinnema1](https://github.com/Sinnema1)
- You can reach me with additional questions at test@test.com.
- PostgreSQL installation Instructions: [Link](https://coding-boot-camp.github.io/full-stack/postgresql/postgresql-installation-guide#install-postgresql-server)
